# Serviços de negócio para o sistema FilaDigital
# Contém lógica complexa para gerenciamento de filas, QR codes e notificações

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models import Fila, UsuariosNaFila, Usuario, Priority, Role
from app.dependencies import impedir_owner_employee_entrar
from typing import Optional, List, Dict
import uuid

class QueueService:
    """Service para gerenciar operações de filas com prioridades"""

    @staticmethod
    def calculate_order_with_priority(fila: Fila, session: Session, priority: Priority = Priority.normal) -> int:
        """Calcula a ordem considerando prioridades"""
        if priority == Priority.high:
            # Prioridade alta: sempre no topo da fila de alta prioridade
            high_priority_count = session.query(UsuariosNaFila).filter(
                and_(
                    UsuariosNaFila.fila_id == fila.id,  # type: ignore
                    UsuariosNaFila.status == "aguardando",  # type: ignore
                    UsuariosNaFila.prioridade == Priority.high  # type: ignore
                )
            ).count()
            return high_priority_count + 1
        else:
            # Prioridade normal: após todas as prioridades altas
            high_priority_count = session.query(UsuariosNaFila).filter(
                and_(
                    UsuariosNaFila.fila_id == fila.id,  # type: ignore
                    UsuariosNaFila.status == "aguardando",  # type: ignore
                    UsuariosNaFila.prioridade == Priority.high  # type: ignore
                )
            ).count()

            normal_priority_count = session.query(UsuariosNaFila).filter(
                and_(
                    UsuariosNaFila.fila_id == fila.id,  # type: ignore
                    UsuariosNaFila.status == "aguardando",  # type: ignore
                    UsuariosNaFila.prioridade == Priority.normal  # type: ignore
                )
            ).count()

            return high_priority_count + normal_priority_count + 1

    @staticmethod
    def call_next_customer(fila: Fila, session: Session, employee: Usuario) -> Optional[UsuariosNaFila]:
        """Chama o próximo cliente considerando prioridades"""
        # Primeiro tenta prioridade alta
        next_customer = session.query(UsuariosNaFila)\
            .filter(
                and_(
                    UsuariosNaFila.fila_id == fila.id,  # type: ignore
                    UsuariosNaFila.status == "aguardando",  # type: ignore
                    UsuariosNaFila.prioridade == Priority.high  # type: ignore
                )
            )\
            .order_by(UsuariosNaFila.ordem).first()  # type: ignore

        # Se não há prioridade alta, pega prioridade normal
        if not next_customer:
            next_customer = session.query(UsuariosNaFila)\
                .filter(
                    and_(
                        UsuariosNaFila.fila_id == fila.id,  # type: ignore
                        UsuariosNaFila.status == "aguardando",  # type: ignore
                        UsuariosNaFila.prioridade == Priority.normal  # type: ignore
                    )
                )\
                .order_by(UsuariosNaFila.ordem).first()  # type: ignore

        if next_customer:
            next_customer.status = "atendido"  # type: ignore
            session.commit()

            # Recalcula ordens após atendimento
            QueueService.recalculate_orders(fila, session)

        return next_customer  # type: ignore

    @staticmethod
    def recalculate_orders(fila: Fila, session: Session):
        """Recalcula as ordens após mudanças na fila"""
        # Recalcula prioridades altas
        high_priority_customers = session.query(UsuariosNaFila)\
            .filter(
                and_(
                    UsuariosNaFila.fila_id == fila.id,  # type: ignore
                    UsuariosNaFila.status == "aguardando",  # type: ignore
                    UsuariosNaFila.prioridade == Priority.high  # type: ignore
                )
            )\
            .order_by(UsuariosNaFila.horario_entrada)\
            .all()

        for i, customer in enumerate(high_priority_customers, 1):
            customer.ordem = i

        # Recalcula prioridades normais
        normal_priority_customers = session.query(UsuariosNaFila)\
            .filter(
                and_(
                    UsuariosNaFila.fila_id == fila.id,  # type: ignore
                    UsuariosNaFila.status == "aguardando",  # type: ignore
                    UsuariosNaFila.prioridade == Priority.normal  # type: ignore
                )
            )\
            .order_by(UsuariosNaFila.horario_entrada)\
            .all()

        base_order = len(high_priority_customers)
        for i, customer in enumerate(normal_priority_customers, 1):
            customer.ordem = base_order + i

        session.commit()

    @staticmethod
    def add_customer_to_queue(fila: Fila, usuario: Usuario, session: Session, priority: Priority = Priority.normal) -> UsuariosNaFila:
        """Adiciona cliente à fila com prioridade"""
        # Verifica se pode entrar
        impedir_owner_employee_entrar(fila, usuario)

        # Verifica se já está na fila
        existing_entry = session.query(UsuariosNaFila).filter(
            and_(
                UsuariosNaFila.usuario_id == usuario.id,  # type: ignore
                UsuariosNaFila.fila_id == fila.id,  # type: ignore
                UsuariosNaFila.status == "aguardando"  # type: ignore
            )
        ).first()

        if existing_entry:
            raise ValueError("Usuário já está nesta fila")

        # Calcula ordem
        ordem = QueueService.calculate_order_with_priority(fila, session, priority)

        # Cria entrada
        entrada = UsuariosNaFila(
            usuario_id=usuario.id,  # type: ignore
            fila_id=fila.id,  # type: ignore
            ordem=ordem,
            status="aguardando",
            prioridade=priority
        )

        session.add(entrada)
        session.commit()

        return entrada

    @staticmethod
    def get_queue_stats(fila: Fila, session: Session) -> Dict:
        """Retorna estatísticas da fila"""
        total_aguardando = session.query(UsuariosNaFila).filter(
            and_(
                UsuariosNaFila.fila_id == fila.id,  # type: ignore
                UsuariosNaFila.status == "aguardando"  # type: ignore
            )
        ).count()

        high_priority_count = session.query(UsuariosNaFila).filter(
            and_(
                UsuariosNaFila.fila_id == fila.id,  # type: ignore
                UsuariosNaFila.status == "aguardando",  # type: ignore
                UsuariosNaFila.prioridade == Priority.high  # type: ignore
            )
        ).count()

        normal_priority_count = session.query(UsuariosNaFila).filter(
            and_(
                UsuariosNaFila.fila_id == fila.id,  # type: ignore
                UsuariosNaFila.status == "aguardando",  # type: ignore
                UsuariosNaFila.prioridade == Priority.normal  # type: ignore
            )
        ).count()

        return {
            "total_aguardando": total_aguardando,
            "prioridade_alta": high_priority_count,
            "prioridade_normal": normal_priority_count,
            "fila_id": fila.id,
            "fila_nome": fila.nome
        }

class QRCodeService:
    """Service para gerar e validar QR Codes de filas"""

    @staticmethod
    def generate_queue_qr(fila: Fila) -> str:
        """Gera código QR único para a fila"""
        # Gera um UUID único para a fila
        qr_code = str(uuid.uuid4())
        # Em produção, isso seria salvo no banco ou cache
        return qr_code

    @staticmethod
    def validate_qr_and_add_customer(qr_code: str, usuario: Usuario, session: Session, priority: Priority = Priority.normal) -> Optional[UsuariosNaFila]:
        """Valida QR code e adiciona cliente à fila correspondente"""
        # Em produção, buscar fila pelo QR code do banco/cache
        # Por enquanto, simula busca por ID da fila
        try:
            fila_id = int(qr_code.split('-')[0])  # Simulação
            fila = session.query(Fila).filter(Fila.id == fila_id).first()
            if fila:
                return QueueService.add_customer_to_queue(fila, usuario, session, priority)
        except (ValueError, IndexError):
            pass
        return None

class NotificationService:
    """Service para gerenciar notificações"""

    @staticmethod
    def notify_customer_called(customer: UsuariosNaFila, session: Session):
        """Notifica cliente que foi chamado"""
        # Em produção, enviar push notification, email, SMS
        print(f"Cliente {customer.usuario_id} chamado para fila {customer.fila_id}")

    @staticmethod
    def notify_queue_updated(fila: Fila, session: Session):
        """Notifica funcionários sobre mudanças na fila"""
        # Em produção, notificar via WebSocket ou push
        print(f"Fila {fila.id} atualizada")

    @staticmethod
    def notify_customer_position(customer: UsuariosNaFila, session: Session):
        """Notifica cliente sobre mudança de posição"""
        # Em produção, enviar notificação em tempo real
        print(f"Cliente {customer.usuario_id} agora está na posição {customer.ordem}")

class DashboardService:
    """Service para dados de dashboard"""

    @staticmethod
    def get_owner_dashboard(owner: Usuario, session: Session) -> Dict:
        """Retorna dados estruturados para dashboard do dono"""
        estabelecimentos = session.query(Fila).join(Fila.estabelecimento).filter(
            Fila.estabelecimento.has(usuario_id=owner.id)
        ).all()

        dashboard_data = {
            "estabelecimentos": [],
            "metricas_gerais": {
                "total_filas": 0,
                "total_clientes_aguardando": 0,
                "tempo_medio_atendimento": 0,
                "fila_mais_longa": None
            }
        }

        for fila in estabelecimentos:
            stats = QueueService.get_queue_stats(fila, session)
            dashboard_data["estabelecimentos"].append({
                "fila_id": fila.id,
                "fila_nome": fila.nome,
                "estabelecimento_nome": fila.estabelecimento.nome,
                "clientes_aguardando": stats["total_aguardando"],
                "prioridade_alta": stats["prioridade_alta"],
                "prioridade_normal": stats["prioridade_normal"]
            })

            dashboard_data["metricas_gerais"]["total_filas"] += 1
            dashboard_data["metricas_gerais"]["total_clientes_aguardando"] += stats["total_aguardando"]

            if not dashboard_data["metricas_gerais"]["fila_mais_longa"] or \
               stats["total_aguardando"] > dashboard_data["metricas_gerais"]["fila_mais_longa"]["clientes"]:
                dashboard_data["metricas_gerais"]["fila_mais_longa"] = {
                    "fila_nome": fila.nome,
                    "clientes": stats["total_aguardando"]
                }

        return dashboard_data

    @staticmethod
    def get_employee_dashboard(employee: Usuario, session: Session) -> Dict:
        """Retorna dados para dashboard do funcionário"""
        if not employee.establishment_id:  # type: ignore
            return {"error": "Funcionário não vinculado a estabelecimento"}

        filas = session.query(Fila).filter(Fila.estabelecimento_id == employee.establishment_id).all()  # type: ignore

        dashboard_data = {
            "filas": [],
            "alertas": []
        }

        for fila in filas:
            stats = QueueService.get_queue_stats(fila, session)
            dashboard_data["filas"].append({
                "fila_id": fila.id,
                "fila_nome": fila.nome,
                "clientes_aguardando": stats["total_aguardando"],
                "proximo_cliente": None  # Implementar lógica para próximo
            })

            # Alertas para filas cheias
            if stats["total_aguardando"] > 10:  # Threshold configurável
                dashboard_data["alertas"].append({
                    "tipo": "fila_cheia",
                    "mensagem": f"Fila {fila.nome} tem {stats['total_aguardando']} clientes aguardando"
                })

        return dashboard_data

    @staticmethod
    def get_customer_dashboard(customer: Usuario, session: Session) -> Dict:
        """Retorna dados para dashboard do cliente"""
        posicoes = session.query(UsuariosNaFila).filter(
            and_(
                UsuariosNaFila.usuario_id == customer.id,  # type: ignore
                UsuariosNaFila.status == "aguardando"  # type: ignore
            )
        ).all()

        historico = session.query(UsuariosNaFila).filter(
            and_(
                UsuariosNaFila.usuario_id == customer.id,  # type: ignore
                UsuariosNaFila.status != "aguardando"  # type: ignore
            )
        ).order_by(UsuariosNaFila.horario_entrada.desc()).limit(10).all()

        return {
            "posicoes_atuais": [
                {
                    "fila_id": pos.fila_id,
                    "fila_nome": pos.fila.nome,
                    "posicao": pos.ordem,
                    "prioridade": pos.prioridade.value,
                    "tempo_espera_estimado": "15-20 min"  # Calcular baseado em histórico
                } for pos in posicoes
            ],
            "historico_recente": [
                {
                    "fila_nome": hist.fila.nome,
                    "estabelecimento": hist.fila.estabelecimento.nome,
                    "status": hist.status,
                    "data": hist.horario_entrada.isoformat()
                } for hist in historico
            ]
        }