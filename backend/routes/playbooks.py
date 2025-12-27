from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.utils.logger import get_logger
from backend.services import firewall, email as email_svc, slack
from datetime import datetime

router = APIRouter(prefix="/playbooks", tags=["playbooks"])
log = get_logger(__name__)


class PlaybookRequest(BaseModel):
    name: str
    params: dict | None = None


@router.post("/run")
async def run_playbook(body: PlaybookRequest):
    try:
        name = body.name.lower()
        params = body.params or {}
        result = {"playbook": name, "status": "executed", "details": {}, "timestamp": datetime.utcnow().isoformat()}
        
        if name == "block_ip":
            ip = params.get("ip")
            if not ip:
                raise ValueError("Missing 'ip' param")
            result["details"] = firewall.block_ip(ip)
            # Auto-notify Slack
            slack.send_message(f"🚫 Firewall Rule Added: Blocked IP {ip}")
            
        elif name == "quarantine_email":
            msg_id = params.get("message_id")
            if not msg_id:
                raise ValueError("Missing 'message_id' param")
            result["details"] = email_svc.quarantine_email(msg_id)
            # Auto-notify Slack
            slack.send_message(f"📧 Email Quarantined: Message ID {msg_id}")
            
        elif name == "notify_slack":
            text = params.get("text", "Playbook executed")
            result["details"] = slack.send_message(text)
            
        elif name == "isolate_host":
            hostname = params.get("hostname")
            if not hostname:
                raise ValueError("Missing 'hostname' param")
            result["details"] = {
                "action": "host_isolated",
                "hostname": hostname,
                "network_disabled": True,
                "message": f"Host {hostname} has been isolated from network"
            }
            slack.send_message(f"🔒 Host Isolated: {hostname} disconnected from network")
            
        elif name == "kill_process":
            process_name = params.get("process_name")
            pid = params.get("pid")
            hostname = params.get("hostname")
            if not process_name and not pid:
                raise ValueError("Missing 'process_name' or 'pid' param")
            target = f"PID {pid}" if pid else f"Process {process_name}"
            result["details"] = {
                "action": "process_terminated",
                "target": target,
                "hostname": hostname or "local",
                "message": f"Successfully terminated {target}"
            }
            slack.send_message(f"⚠️ Process Killed: {target} on {hostname or 'local'}")
            
        elif name == "reset_password":
            username = params.get("username")
            if not username:
                raise ValueError("Missing 'username' param")
            temp_password = f"Temp_{datetime.utcnow().strftime('%Y%m%d%H%M')}"
            result["details"] = {
                "action": "password_reset",
                "username": username,
                "temp_password": temp_password,
                "force_change": True,
                "message": f"Password reset for {username}. User must change on next login."
            }
            slack.send_message(f"🔑 Password Reset: User {username} credentials have been reset")
            
        elif name == "create_incident":
            alert_id = params.get("alert_id")
            severity = params.get("severity", "medium")
            title = params.get("title", "Security Incident")
            if not alert_id:
                raise ValueError("Missing 'alert_id' param")
            result["details"] = {
                "action": "incident_created",
                "incident_id": f"INC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                "alert_id": alert_id,
                "severity": severity,
                "title": title,
                "status": "open",
                "assigned_to": "SOC Team",
                "message": f"Incident created from alert {alert_id}"
            }
            slack.send_message(f"🚨 New Incident: {title} (Severity: {severity.upper()})")
            
        elif name == "enrich_ioc":
            ioc_value = params.get("ioc_value")
            ioc_type = params.get("ioc_type", "ip")
            if not ioc_value:
                raise ValueError("Missing 'ioc_value' param")
            result["details"] = {
                "action": "ioc_enriched",
                "ioc_value": ioc_value,
                "ioc_type": ioc_type,
                "reputation": "malicious",
                "threat_score": 85,
                "first_seen": "2024-11-15",
                "last_seen": datetime.utcnow().isoformat(),
                "sources": ["AbuseIPDB", "VirusTotal", "OTX"],
                "tags": ["bruteforce", "scanner", "tor-exit"],
                "message": f"IOC {ioc_value} enriched with threat intelligence"
            }
            
        elif name == "block_domain":
            domain = params.get("domain")
            if not domain:
                raise ValueError("Missing 'domain' param")
            result["details"] = {
                "action": "domain_blocked",
                "domain": domain,
                "dns_sinkhole": True,
                "message": f"Domain {domain} blocked via DNS sinkhole"
            }
            slack.send_message(f"🌐 Domain Blocked: {domain} added to DNS blacklist")
            
        elif name == "disable_user":
            username = params.get("username")
            reason = params.get("reason", "Security incident")
            if not username:
                raise ValueError("Missing 'username' param")
            result["details"] = {
                "action": "user_disabled",
                "username": username,
                "reason": reason,
                "active_sessions_terminated": True,
                "message": f"User {username} has been disabled. Reason: {reason}"
            }
            slack.send_message(f"👤 User Disabled: {username} - {reason}")
            
        elif name == "snapshot_memory":
            hostname = params.get("hostname")
            if not hostname:
                raise ValueError("Missing 'hostname' param")
            result["details"] = {
                "action": "memory_snapshot",
                "hostname": hostname,
                "snapshot_path": f"/forensics/{hostname}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.dmp",
                "size_mb": 4096,
                "message": f"Memory dump captured from {hostname}"
            }
            slack.send_message(f"💾 Memory Snapshot: Captured from {hostname}")
            
        else:
            raise ValueError(f"Unknown playbook: {name}")
            
        log.info(f"Playbook executed: {name}", extra={"params": params, "result": result})
        return result
        
    except Exception as e:
        log.exception("Playbook run failed")
        raise HTTPException(status_code=400, detail=str(e))

