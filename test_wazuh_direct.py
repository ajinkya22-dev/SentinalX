import os
import requests
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

api_url = os.getenv('WAZUH_API_URL')
api_user = os.getenv('WAZUH_API_USER')
api_password = os.getenv('WAZUH_API_PASSWORD')
verify_ssl = False  # Try with SSL disabled first

print(f"Testing Wazuh API Connection:")
print(f"URL: {api_url}")
print(f"User: {api_user}")
print(f"Password: {'*' * len(api_password) if api_password else 'NOT SET'}")
print(f"SSL Verification: {verify_ssl}")
print("-" * 50)

try:
    auth_url = f"{api_url}/security/user/authenticate"
    print(f"\nAttempting authentication to: {auth_url}")
    
    response = requests.post(
        auth_url,
        auth=HTTPBasicAuth(api_user, api_password),
        verify=verify_ssl,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('data', {}).get('token')
        print(f"\n✅ Authentication successful!")
        print(f"Token: {token[:50]}..." if token else "No token received")
        
        # Try to get agents
        print("\n" + "=" * 50)
        print("Testing /agents endpoint:")
        headers = {'Authorization': f'Bearer {token}'}
        agents_response = requests.get(
            f"{api_url}/agents",
            headers=headers,
            verify=verify_ssl,
            timeout=10
        )
        print(f"Status Code: {agents_response.status_code}")
        print(f"Response: {agents_response.text[:500]}")
    else:
        print(f"\n❌ Authentication failed!")
        response.raise_for_status()
        
except requests.exceptions.SSLError as e:
    print(f"\n❌ SSL Error: {e}")
    print("Try setting WAZUH_VERIFY_SSL=false in .env")
except requests.exceptions.ConnectionError as e:
    print(f"\n❌ Connection Error: {e}")
    print("Check if Wazuh manager is accessible at the specified URL")
except requests.exceptions.Timeout as e:
    print(f"\n❌ Timeout Error: {e}")
except Exception as e:
    print(f"\n❌ Error: {type(e).__name__}: {e}")
