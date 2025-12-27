"""
MongoDB Atlas Setup Script
Creates necessary collections and indexes for SentinalX
"""

from motor.motor_asyncio import AsyncIOMotorClient
from backend.utils.config import settings
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def setup_mongodb():
    """Initialize MongoDB Atlas with required collections and indexes"""
    
    logger.info("Connecting to MongoDB Atlas...")
    logger.info(f"Database: {settings.MONGO_DB_NAME}")
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.MONGO_URI)
        db = client[settings.MONGO_DB_NAME]
        
        # Test connection
        await client.admin.command('ping')
        logger.info("✅ Connected to MongoDB Atlas successfully!")
        
        # Get existing collections
        existing_collections = await db.list_collection_names()
        logger.info(f"Existing collections: {existing_collections}")
        
        # Define collections to create
        collections = [
            'alerts',
            'enriched_alerts',
            'incidents',
            'cases',
            'users',
            'playbooks',
            'threat_intel',
            'logs'
        ]
        
        logger.info("\n📦 Setting up collections...")
        
        for collection_name in collections:
            if collection_name not in existing_collections:
                await db.create_collection(collection_name)
                logger.info(f"✅ Created collection: {collection_name}")
            else:
                logger.info(f"⏭️  Collection already exists: {collection_name}")
        
        # Create indexes for better performance
        logger.info("\n🔍 Creating indexes...")
        
        # Alerts indexes
        await db.alerts.create_index([("timestamp", -1)])
        await db.alerts.create_index([("severity", 1)])
        await db.alerts.create_index([("source", 1)])
        logger.info("✅ Created indexes for 'alerts'")
        
        # Enriched alerts indexes
        await db.enriched_alerts.create_index([("enrichment.threat_score", -1)])
        await db.enriched_alerts.create_index([("enrichment.is_malicious", 1)])
        await db.enriched_alerts.create_index([("timestamp", -1)])
        logger.info("✅ Created indexes for 'enriched_alerts'")
        
        # Incidents indexes
        await db.incidents.create_index([("status", 1)])
        await db.incidents.create_index([("severity", 1)])
        await db.incidents.create_index([("created_at", -1)])
        logger.info("✅ Created indexes for 'incidents'")
        
        # Users indexes
        await db.users.create_index([("email", 1)], unique=True)
        await db.users.create_index([("username", 1)], unique=True)
        logger.info("✅ Created indexes for 'users'")
        
        # Threat intel indexes
        await db.threat_intel.create_index([("ioc", 1), ("type", 1)])
        await db.threat_intel.create_index([("timestamp", -1)])
        logger.info("✅ Created indexes for 'threat_intel'")
        
        # Insert sample data for testing (optional)
        logger.info("\n📝 Checking for sample data...")
        
        alerts_count = await db.alerts.count_documents({})
        if alerts_count == 0:
            sample_alert = {
                "source": "system",
                "severity": "info",
                "type": "setup",
                "description": "SentinalX MongoDB Atlas setup completed",
                "timestamp": "2025-12-12T00:00:00Z",
                "status": "active"
            }
            await db.alerts.insert_one(sample_alert)
            logger.info("✅ Inserted sample alert")
        else:
            logger.info(f"⏭️  Database already has {alerts_count} alerts")
        
        # Summary
        logger.info("\n" + "="*60)
        logger.info("🎉 MongoDB Atlas Setup Complete!")
        logger.info("="*60)
        logger.info(f"\n📊 Database: {settings.MONGO_DB_NAME}")
        logger.info(f"📦 Collections created: {len(collections)}")
        logger.info(f"🔍 Indexes created: Multiple (for performance)")
        logger.info(f"\n✅ Your SentinalX platform is ready to store data!")
        logger.info("\nNext steps:")
        logger.info("1. Start the backend: uvicorn backend.app:app --reload --port 8000")
        logger.info("2. Access API docs: http://localhost:8000/docs")
        logger.info("3. Test health: http://localhost:8000/health")
        logger.info("="*60 + "\n")
        
        client.close()
        
    except Exception as e:
        logger.error(f"❌ Error setting up MongoDB: {str(e)}")
        logger.error("\nPlease check:")
        logger.error("1. Your MONGO_URI in .env file is correct")
        logger.error("2. Your MongoDB Atlas cluster is running")
        logger.error("3. Your IP address is whitelisted in Atlas")
        logger.error("4. Network access is configured in Atlas")
        raise


if __name__ == "__main__":
    asyncio.run(setup_mongodb())
