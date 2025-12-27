from backend.utils.logger import get_logger

log = get_logger(__name__)


def block_ip(ip: str) -> dict:
    # Stub: In real life, integrate with firewall (e.g., iptables, cloud provider, etc.)
    log.info(f"Blocking IP {ip} (stub)")
    return {"action": "block_ip", "ip": ip, "status": "requested"}

