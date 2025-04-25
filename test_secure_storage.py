from secure_storage import SecureStorage

def test_secure_storage():
    print("=== Testing Secure Storage System ===")
    
    # Initialize the secure storage
    secure_system = SecureStorage()
    
    # Test user registration
    print("\n1. Testing user registration...")
    secure_system.register_user("testuser", "securepasskey123")
    
    # Test login with correct passkey
    print("\n2. Testing login with correct passkey...")
    secure_system.login("testuser", "securepasskey123")
    
    # Test storing data
    print("\n3. Testing data storage...")
    # Simulate user input for passkey verification
    import getpass
    original_getpass = getpass.getpass
    getpass.getpass = lambda prompt: "securepasskey123"
    
    secure_system.store_data("secret_note", "This is a confidential message")
    secure_system.store_data("credit_card", {"number": "1234-5678-9012-3456", "expiry": "12/25", "cvv": "123"})
    
    # Test listing data keys
    print("\n4. Testing listing data keys...")
    secure_system.list_data_keys()
    
    # Test retrieving data
    print("\n5. Testing data retrieval...")
    retrieved_note = secure_system.retrieve_data("secret_note")
    print(f"Retrieved note: {retrieved_note}")
    
    retrieved_card = secure_system.retrieve_data("credit_card")
    print(f"Retrieved card: {retrieved_card}")
    
    # Test failed login attempts
    print("\n6. Testing failed login attempts...")
    secure_system.logout()
    
    # Try incorrect passkey multiple times
    for i in range(4):
        print(f"Attempt {i+1} with wrong passkey:")
        secure_system.login("testuser", "wrongpasskey")
    
    # Try correct passkey after lockout
    print("\nTrying correct passkey after lockout:")
    secure_system.login("testuser", "securepasskey123")
    
    # Restore original getpass function
    getpass.getpass = original_getpass
    
    print("\n=== Test completed ===")

if __name__ == "__main__":
    test_secure_storage()
