#!/usr/bin/env python
"""
Test script for email spam detection
Run this to test the spam email analyzer with various examples
"""
import requests
import json
from colorama import init, Fore, Style

# Initialize colorama for colored output
init(autoreset=True)

def test_email(sender, subject, content, test_name):
    """Test email spam detection and display results"""
    url = "http://localhost:5000/analyze-email"
    
    data = {
        "sender": sender,
        "subject": subject,
        "content": content
    }
    
    print(f"\n{Fore.CYAN}{'='*70}")
    print(f"{Fore.WHITE}{Style.BRIGHT}TEST: {test_name}")
    print(f"{Fore.CYAN}{'='*70}")
    print(f"{Fore.YELLOW}Sender:  {sender}")
    print(f"{Fore.YELLOW}Subject: {subject}")
    print(f"{Fore.YELLOW}Content: {content[:60]}...")
    
    try:
        response = requests.post(url, json=data)
        result = response.json()
        
        print(f"\n{Fore.WHITE}{Style.BRIGHT}RESULTS:")
        print(f"{Fore.CYAN}{'─'*70}")
        
        # Color code based on spam status
        spam_color = Fore.RED if result['isSpam'] else Fore.GREEN
        print(f"{spam_color}Is Spam:     {result['isSpam']}")
        print(f"{Fore.YELLOW}Confidence:  {result['confidence']}%")
        
        # Color code risk level
        risk_colors = {'low': Fore.GREEN, 'medium': Fore.YELLOW, 'high': Fore.RED}
        risk_color = risk_colors.get(result['riskLevel'], Fore.WHITE)
        print(f"{risk_color}Risk Level:  {result['riskLevel'].upper()}")
        
        # Show reasons
        if result['reasons']:
            print(f"{Fore.MAGENTA}Reasons:     {', '.join(result['reasons'])}")
        else:
            print(f"{Fore.GREEN}Reasons:     None (Clean email)")
        
        print(f"{Fore.CYAN}{'='*70}\n")
        
    except Exception as e:
        print(f"{Fore.RED}ERROR: {str(e)}\n")

def main():
    """Run all test cases"""
    print(f"\n{Fore.GREEN}{Style.BRIGHT}{'*'*70}")
    print(f"{Fore.GREEN}{Style.BRIGHT}*{'EMAIL SPAM DETECTION TESTER':^68}*")
    print(f"{Fore.GREEN}{Style.BRIGHT}{'*'*70}\n")
    
    # Test 1: High-risk phishing email
    test_email(
        sender="urgent@freedomain.com",
        subject="URGENT: Your Account Has Been Suspended!",
        content="Your bank account will be permanently closed. Click here to verify your password, credit card details, and social security number immediately: http://fake-bank-site.com",
        test_name="Test 1: High-Risk Phishing Email"
    )
    
    # Test 2: Legitimate newsletter
    test_email(
        sender="newsletter@techcompany.com",
        subject="Weekly Tech Newsletter - January 2026",
        content="Hello! Here are this week's top technology articles, product updates, and interesting insights from our team. Happy reading!",
        test_name="Test 2: Legitimate Newsletter"
    )
    
    # Test 3: Moderate spam with promotional content
    test_email(
        sender="promo@disposablemail.com",
        subject="You've Won! Claim Your Prize Now",
        content="Congratulations! You've been selected to receive a $1000 gift card. Click this link to claim: http://suspicious-promo.com",
        test_name="Test 3: Promotional Spam with Suspicious Link"
    )
    
    # Test 4: Tech support scam
    test_email(
        sender="support@tempemail.com",
        subject="IMMEDIATE ACTION REQUIRED: Security Alert",
        content="We detected suspicious activity on your account. Please verify your password and bank account information at http://fake-support.com within 24 hours.",
        test_name="Test 4: Tech Support Scam"
    )
    
    # Test 5: Clean business email
    test_email(
        sender="sales@legitcompany.com",
        subject="Meeting Follow-up - Q1 2026 Planning",
        content="Hi team, thank you for attending today's meeting. Here's a summary of our Q1 planning discussion and action items for next week.",
        test_name="Test 5: Legitimate Business Email"
    )
    
    # Test 6: Invoice scam
    test_email(
        sender="billing@freemail.com",
        subject="URGENT: Unpaid Invoice - Action Required",
        content="Your account shows an unpaid invoice. Please click here http://fake-invoice.com and enter your credit card to avoid service interruption.",
        test_name="Test 6: Invoice Scam"
    )
    
    print(f"\n{Fore.GREEN}{Style.BRIGHT}{'*'*70}")
    print(f"{Fore.GREEN}{Style.BRIGHT}* {'TESTING COMPLETE!':^66} *")
    print(f"{Fore.GREEN}{Style.BRIGHT}{'*'*70}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Testing interrupted by user.")
    except Exception as e:
        print(f"\n{Fore.RED}Error: {str(e)}")
