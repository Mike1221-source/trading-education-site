import requests
import sys
import json
from datetime import datetime

class TradingAcademyAPITester:
    def __init__(self, base_url="https://trade-pro-hub-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()

    def run_test(self, name, method, endpoint, expected_status, data=None, use_auth=False):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_auth and self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Expected {expected_status}, got {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2, default=str)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Response Text: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_blog_posts(self):
        """Test blog posts endpoint"""
        success, response = self.run_test(
            "Get Blog Posts",
            "GET",
            "/api/blog/posts",
            200
        )
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} blog posts")
            # Test individual blog post
            first_post = response[0]
            if 'slug' in first_post:
                self.run_test(
                    f"Get Blog Post - {first_post['slug']}",
                    "GET",
                    f"/api/blog/posts/{first_post['slug']}",
                    200
                )
        return success

    def test_signup_login_flow(self):
        """Test complete signup and login flow"""
        timestamp = int(datetime.now().timestamp())
        test_email = f"test_{timestamp}@example.com"
        test_password = "TestPass123!"
        test_name = f"Test User {timestamp}"

        # Test signup
        success, response = self.run_test(
            "User Signup",
            "POST",
            "/api/auth/signup",
            200,
            data={
                "email": test_email,
                "password": test_password,
                "name": test_name
            }
        )
        
        if success and 'session_token' in response:
            self.session_token = response['session_token']
            print(f"   Stored session token: {self.session_token[:20]}...")
            
            # Test protected endpoint with session
            auth_success = self.test_protected_endpoints()
            
            # Test logout
            self.run_test(
                "User Logout",
                "POST",
                "/api/auth/logout",
                200,
                use_auth=True
            )
            
            # Test login with same credentials
            login_success, login_response = self.run_test(
                "User Login",
                "POST",
                "/api/auth/login",
                200,
                data={
                    "email": test_email,
                    "password": test_password
                }
            )
            
            if login_success and 'session_token' in login_response:
                self.session_token = login_response['session_token']
                print(f"   New session token: {self.session_token[:20]}...")
            
            return success and auth_success and login_success
        
        return False

    def test_protected_endpoints(self):
        """Test protected endpoints requiring authentication"""
        if not self.session_token:
            print("❌ No session token available for protected endpoint testing")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/api/auth/me",
            200,
            use_auth=True
        )
        
        return success

    def test_lead_capture(self):
        """Test lead capture functionality"""
        timestamp = int(datetime.now().timestamp())
        
        success, response = self.run_test(
            "Create Lead",
            "POST",
            "/api/leads",
            200,
            data={
                "email": f"lead_{timestamp}@example.com",
                "name": f"Lead User {timestamp}"
            }
        )
        
        return success

    def test_invalid_endpoints(self):
        """Test error handling"""
        # Test non-existent blog post
        self.run_test(
            "Get Non-existent Blog Post",
            "GET",
            "/api/blog/posts/non-existent-slug",
            404
        )
        
        # Test protected endpoint without auth
        self.session_token = None
        self.run_test(
            "Get User Without Auth",
            "GET",
            "/api/auth/me",
            401
        )
        
        # Test invalid login
        self.run_test(
            "Invalid Login",
            "POST",
            "/api/auth/login",
            401,
            data={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
        )

def main():
    print("🚀 Starting Trading Academy API Tests...")
    tester = TradingAcademyAPITester()
    
    # Test blog functionality (no auth required)
    print("\n" + "="*50)
    print("TESTING BLOG FUNCTIONALITY")
    print("="*50)
    tester.test_blog_posts()
    
    # Test lead capture
    print("\n" + "="*50)
    print("TESTING LEAD CAPTURE")
    print("="*50)
    tester.test_lead_capture()
    
    # Test authentication flow
    print("\n" + "="*50)
    print("TESTING AUTHENTICATION FLOW")
    print("="*50)
    tester.test_signup_login_flow()
    
    # Test error handling
    print("\n" + "="*50)
    print("TESTING ERROR HANDLING")
    print("="*50)
    tester.test_invalid_endpoints()
    
    # Print final results
    print("\n" + "="*50)
    print("TEST RESULTS")
    print("="*50)
    print(f"📊 Tests Run: {tester.tests_run}")
    print(f"✅ Tests Passed: {tester.tests_passed}")
    print(f"❌ Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"📈 Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️  {tester.tests_run - tester.tests_passed} TESTS FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())