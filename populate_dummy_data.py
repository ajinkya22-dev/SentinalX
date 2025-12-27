"""
Dummy Data Generator for SentinalX SOC Dashboard
Populates MongoDB with realistic security alerts and incidents
"""
import asyncio
from datetime import datetime, timedelta, timezone
import random
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

# Alert sources and types
SOURCES = [
    "wazuh", "ids", "firewall", "edr", "siem", "cloudtrail", 
    "azure_sentinel", "crowdstrike", "defender", "suricata"
]

ALERT_TYPES = [
    "intrusion", "malware", "brute_force", "data_exfiltration",
    "unauthorized_access", "privilege_escalation", "lateral_movement",
    "phishing", "ddos", "ransomware", "suspicious_traffic", "policy_violation"
]

SEVERITIES = ["low", "medium", "high", "critical"]
SEVERITY_WEIGHTS = [40, 30, 20, 10]  # Distribution: more low, fewer critical

STATUSES = ["new", "investigating", "false_positive", "resolved"]
STATUS_WEIGHTS = [50, 30, 10, 10]

INCIDENT_STATUSES = ["open", "in_progress", "resolved", "closed"]

DESCRIPTIONS = {
    "intrusion": [
        "Multiple failed login attempts from {ip}",
        "Suspicious port scan detected from {ip}",
        "Unauthorized access attempt to {resource}",
    ],
    "malware": [
        "Malicious file detected: {file}",
        "Suspicious process execution: {process}",
        "Known malware signature detected on {host}",
    ],
    "brute_force": [
        "SSH brute force attack from {ip}",
        "RDP brute force detected from {ip}",
        "Multiple password failures for user {user}",
    ],
    "data_exfiltration": [
        "Large data transfer to external IP {ip}",
        "Unusual outbound traffic pattern detected",
        "Sensitive file upload to {domain}",
    ],
    "privilege_escalation": [
        "User {user} escalated privileges",
        "Sudo abuse detected for {user}",
        "Admin rights granted to non-admin user",
    ],
}

SAMPLE_IPS = [
    "192.168.1.100", "10.0.0.50", "172.16.0.25", "45.33.32.156",
    "185.220.101.5", "23.129.64.184", "89.248.172.16", "103.85.24.151"
]

SAMPLE_HOSTS = [
    "web-server-01", "db-prod-02", "app-staging-03", "worker-node-04",
    "win-desktop-15", "linux-srv-22", "backup-server", "mail-gateway"
]

SAMPLE_USERS = [
    "admin", "jdoe", "asmith", "service_account", "root", "backup_user"
]


async def generate_alerts(db, count=100):
    """Generate random alerts spanning the last 30 days"""
    alerts = []
    now = datetime.now(timezone.utc)
    
    for _ in range(count):
        # Random time in last 30 days
        days_ago = random.uniform(0, 30)
        created_at = now - timedelta(days=days_ago)
        
        alert_type = random.choice(ALERT_TYPES)
        severity = random.choices(SEVERITIES, SEVERITY_WEIGHTS)[0]
        source = random.choice(SOURCES)
        status = random.choices(STATUSES, STATUS_WEIGHTS)[0]
        
        # Generate description with placeholders
        desc_templates = DESCRIPTIONS.get(alert_type, ["Alert detected for {type}"])
        desc = random.choice(desc_templates).format(
            ip=random.choice(SAMPLE_IPS),
            host=random.choice(SAMPLE_HOSTS),
            user=random.choice(SAMPLE_USERS),
            resource=random.choice(SAMPLE_HOSTS),
            file="malware.exe",
            process="suspicious_process.exe",
            domain="suspicious-domain.com",
            type=alert_type
        )
        
        alert = {
            "source": source,
            "severity": severity,
            "type": alert_type,
            "description": desc,
            "status": status,
            "createdAt": created_at.isoformat().replace("+00:00", "Z"),
            "metadata": {
                "ip": random.choice(SAMPLE_IPS),
                "host": random.choice(SAMPLE_HOSTS),
                "user": random.choice(SAMPLE_USERS) if random.random() > 0.5 else None,
            }
        }
        alerts.append(alert)
    
    # Insert in batches
    if alerts:
        result = await db.alerts.insert_many(alerts)
        print(f"✅ Inserted {len(result.inserted_ids)} alerts")
    return alerts


async def generate_incidents(db, alert_ids, count=20):
    """Generate incidents linked to random alerts"""
    incidents = []
    now = datetime.now(timezone.utc)
    
    incident_titles = [
        "Ransomware outbreak on production servers",
        "Phishing campaign targeting finance department",
        "Brute force attack from multiple IPs",
        "Data exfiltration attempt blocked",
        "Privilege escalation on web server",
        "Malware detected on endpoint devices",
        "DDoS attack mitigated",
        "Unauthorized access to database server",
        "Suspicious lateral movement detected",
        "Policy violation - Shadow IT discovery",
    ]
    
    for i in range(count):
        days_ago = random.uniform(0, 30)
        created_at = now - timedelta(days=days_ago)
        
        # Random number of linked alerts (1-5)
        num_alerts = random.randint(1, min(5, len(alert_ids)))
        linked_alerts = random.sample([str(aid) for aid in alert_ids], num_alerts)
        
        status = random.choice(INCIDENT_STATUSES)
        
        incident = {
            "title": random.choice(incident_titles) if i < 10 else f"Security incident #{i+1}",
            "status": status,
            "alerts": linked_alerts,
            "notes": [
                f"Incident created at {created_at.strftime('%Y-%m-%d %H:%M')}",
                "Initial triage completed" if status != "open" else "Pending review",
            ] if random.random() > 0.3 else [],
            "createdAt": created_at.isoformat().replace("+00:00", "Z"),
            "metadata": {
                "assignee": random.choice(SAMPLE_USERS),
                "priority": random.choice(["low", "medium", "high", "critical"]),
            }
        }
        incidents.append(incident)
    
    if incidents:
        result = await db.incidents.insert_many(incidents)
        print(f"✅ Inserted {len(result.inserted_ids)} incidents")


async def populate_database():
    """Main function to populate the database with dummy data"""
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGO_DB_NAME", "SentinalX")
    
    print(f"🔗 Connecting to MongoDB: {db_name}")
    client = AsyncIOMotorClient(mongo_uri)
    db = client[db_name]
    
    try:
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful")
        
        # Clear existing data (optional - comment out to keep existing data)
        print("\n🗑️  Clearing existing data...")
        await db.alerts.delete_many({})
        await db.incidents.delete_many({})
        print("✅ Cleared existing alerts and incidents")
        
        # Generate alerts
        print("\n📊 Generating alerts...")
        alerts = await generate_alerts(db, count=150)
        
        # Get alert IDs for linking to incidents
        alert_docs = await db.alerts.find({}).to_list(length=1000)
        alert_ids = [doc["_id"] for doc in alert_docs]
        
        # Generate incidents
        print("\n🎯 Generating incidents...")
        await generate_incidents(db, alert_ids, count=25)
        
        # Print summary
        print("\n" + "="*50)
        print("📈 DATABASE SUMMARY")
        print("="*50)
        
        total_alerts = await db.alerts.count_documents({})
        total_incidents = await db.incidents.count_documents({})
        
        print(f"Total Alerts: {total_alerts}")
        print(f"Total Incidents: {total_incidents}")
        
        # Alert breakdown by severity
        print("\n🔴 Alerts by Severity:")
        for severity in SEVERITIES:
            count = await db.alerts.count_documents({"severity": severity})
            print(f"  {severity.capitalize()}: {count}")
        
        # Incident breakdown by status
        print("\n📋 Incidents by Status:")
        for status in INCIDENT_STATUSES:
            count = await db.incidents.count_documents({"status": status})
            print(f"  {status.replace('_', ' ').capitalize()}: {count}")
        
        print("\n✅ Dummy data generation complete!")
        print(f"🌐 View dashboard at: http://localhost:5174")
        print(f"📚 View API docs at: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    print("="*50)
    print("🎭 SentinalX Dummy Data Generator")
    print("="*50)
    asyncio.run(populate_database())
