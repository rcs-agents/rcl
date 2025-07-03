/**
 * Formal Specification Examples Tests
 * 
 * Tests every example from the formal specification documents to ensure
 * 100% compliance with the documented grammar and syntax.
 */

import { describe, test, expect } from 'vitest';
import { RclParser } from '../../src/parser/parser/index.js';
import { RclLexer } from '../../src/parser/lexer/index.js';

describe('Formal Specification Examples', () => {
  let parser: RclParser;
  let lexer: RclLexer;

  beforeEach(() => {
    parser = new RclParser();
    lexer = new RclLexer();
  });

  describe('Section 2: Lexical Examples', () => {
    test('Multi-line Expression Examples (Lines 190-191)', () => {
      const examples = [
        '$js>>>',
        '$ts>>>',
        '$>>>'
      ];

      examples.forEach(example => {
        const result = lexer.tokenize(example);
        expect(result.errors).toHaveLength(0);
        expect(result.tokens.some(t => t.tokenType.name === 'MULTI_LINE_EXPRESSION_START')).toBe(true);
      });
    });

    test('Embedded Code Examples (Line 196)', () => {
      const examples = [
        '$js> getValue()',
        '$ts> (user as User).getName()',
        '$> simpleExpression'
      ];

      examples.forEach(example => {
        const result = lexer.tokenize(example);
        expect(result.errors).toHaveLength(0);
        expect(result.tokens.some(t => t.tokenType.name === 'EMBEDDED_CODE')).toBe(true);
      });
    });

    test('Multi-line String Examples (Lines 195-212)', () => {
      const examples = [
        {
          marker: '|',
          name: 'MULTILINE_STR_CLEAN'
        },
        {
          marker: '|-',
          name: 'MULTILINE_STR_TRIM'
        },
        {
          marker: '+|',
          name: 'MULTILINE_STR_PRESERVE'
        },
        {
          marker: '+|+',
          name: 'MULTILINE_STR_PRESERVE_ALL'
        }
      ];

      examples.forEach(example => {
        const input = `text: ${example.marker}
  This is multi-line content
  with proper indentation`;
        
        const result = lexer.tokenize(input);
        expect(result.errors).toHaveLength(0);
        expect(result.tokens.some(t => t.tokenType.name === example.name)).toBe(true);
      });
    });
  });

  describe('Section 3: Syntactic Examples', () => {
    test('RclFile Structure Example (Lines 228-246)', () => {
      const input = `import Shared / Common Utils

agent Customer Support:
  displayName: "Customer Support Bot"
  brandName: "ACME Corporation"
  
  agentConfig Config:
    description: "24/7 customer support agent"
    
  agentDefaults Defaults:
    messageTrafficType: :transactional
    
  flow Welcome Flow:
    :start -> Welcome Message
    
  messages Messages:
    Welcome Message:
      text "Hello! How can I help you today?"`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.ast?.imports).toHaveLength(1);
      expect(result.ast?.agentDefinition?.name).toBe('Customer Support');
      expect(result.ast?.agentDefinition?.displayName).toBe('Customer Support Bot');
      expect(result.ast?.agentDefinition?.brandName).toBe('ACME Corporation');
      expect(result.errors).toHaveLength(0);
    });

    test('Import Statement Examples (Lines 234-235)', () => {
      const examples = [
        'import Simple Flow',
        'import My Brand / Customer Support',
        'import Shared / Common / Utils as Utilities',
        'import External / Service from "external-service"'
      ];

      examples.forEach(example => {
        const fullInput = `${example}

agent Test:
  displayName: "Test"
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

        const result = parser.parse(fullInput);
        expect(result.ast?.imports).toHaveLength(1);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('Flow Rule Examples (Lines 277-295)', () => {
      const input = `agent Test:
  displayName: "Test"
  
  messages Messages:
    A: text "A"
    B: text "B"
    C: text "C"
    D: text "D"
  
  flow Complex Flow:
    :start -> A -> B -> C
    A -> D with:
      priority: "high"
      userId: \$js> context.user.id`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Section 4: Identifier Examples (Line 575)', () => {
    test('Space-separated Identifier Pattern', () => {
      const examples = [
        'Customer Support Agent',
        'Order Processing Flow',
        'User Account Manager',
        'Payment Gateway Service'
      ];

      examples.forEach(example => {
        const result = lexer.tokenize(example);
        const identifierTokens = result.tokens.filter(t => t.tokenType.name === 'IDENTIFIER');
        expect(identifierTokens).toHaveLength(1);
        expect(identifierTokens[0].image).toBe(example);
      });
    });
  });

  describe('Section 5: Data Type Examples', () => {
    test('Basic Value Types', () => {
      const input = `agent Test:
  displayName: "Test Agent"
  
  stringValue: "Hello, World!"
  numberValue: 42.5
  booleanValue: True
  nullValue: Null
  atomValue: :transactional
  
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    test('Collection Types', () => {
      const input = `agent Test:
  displayName: "Test Agent"
  
  inlineList: ("item1", "item2", "item3")
  blockList:
    - "first item"
    - "second item"
    - "third item"
    
  inlineDict: {name: "John", age: 30}
  blockDict:
    name: "John Doe"
    email: <email john@example.com>
    
  mappedType list of (label, <phone number>):
    - "Home", "+1-555-0001"
    - "Work", "+1-555-0002"
  
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    test('Type Tags', () => {
      const input = `agent Test:
  displayName: "Test Agent"
  
  contactInfo:
    email: <email support@company.com>
    phone: <phone +1-555-0123>
    website: <url https://company.com>
    
  eventDetails:
    startTime: <time 2:30pm | EST>
    eventDate: <date March 15th, 2024>
    location: <zip 10001>
  
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Section 6: Collection Examples', () => {
    test('List Syntax Variations', () => {
      const input = `agent Test:
  displayName: "Test Agent"
  
  # Inline parenthesized list
  tags: ("support", "customer-service", "help")
  
  # Block dash list
  features:
    - "24/7 availability"
    - "Multi-language support"
    - "Smart routing"
    
  # Mixed content list
  mixedList:
    - "string item"
    - 42
    - True
    - :atom
  
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    test('Dictionary Syntax Variations', () => {
      const input = `agent Test:
  displayName: "Test Agent"
  
  # Inline brace dictionary
  quickDict: {name: "test", active: True}
  
  # Block colon dictionary
  detailedConfig:
    timeout: 30
    retries: 3
    enableLogging: True
    endpoints:
      primary: <url https://api.primary.com>
      backup: <url https://api.backup.com>
  
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    test('Mapped Type Examples', () => {
      const input = `agent Test:
  displayName: "Test Agent"
  
  # Simple mapped type
  phoneNumbers list of (label, <phone number>):
    - "Home", "+1-555-0001"
    - "Work", "+1-555-0002"
    - "Mobile", "+1-555-0003"
    
  # Complex mapped type
  locations list of (name, <zip code>, description):
    - "Headquarters", "10001", "Main office location"
    - "Branch Office", "90210", "West coast branch"
  
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Section 7: Section Examples', () => {
    test('Complete Agent with All Sections', () => {
      const input = `import Shared / Common Flows

agent Comprehensive Support Agent:
  displayName: "Comprehensive Support"
  brandName: "ACME Corporation"
  
  agentConfig Config:
    description: "Full-featured customer support agent"
    version: "2.1.0"
    supportedLanguages: ("en", "es", "fr")
    
  agentDefaults Defaults:
    messageTrafficType: :transactional
    timeout: 30
    retryCount: 3
    
  flow Welcome Flow:
    :start -> Welcome Message -> Main Menu
    
    when user.language is "es":
      :start -> Spanish Welcome
      
    when user.isPremium is True:
      Welcome Message -> Premium Menu
      
    Main Menu -> FAQ with:
      category: \$js> user.selectedCategory
      
  flow Support Flow:
    :start -> Collect Info -> Route To Agent
    
    Route To Agent with:
      priority: \$js> calculatePriority(user.tier)
      department: "technical"
      
  messages Messages:
    Welcome Message:
      text "Welcome to ACME Support! How can I assist you today?"
        suggestions:
          reply "Technical Issue"
          reply "Billing Question"
          reply "General Inquiry"
          
    Spanish Welcome:
      text "¡Bienvenido al soporte de ACME! ¿Cómo puedo ayudarte?"
      
    Main Menu:
      richCard "Support Options" :vertical :center :medium:
        description: "Choose how you'd like to get help"
        suggestions:
          reply "Chat with Agent"
          reply "Browse FAQ"
          openUrl "Help Center" <url https://help.acme.com>
          
    Premium Menu:
      promotional richCard "Premium Support" :horizontal :left :large <url https://acme.com/premium.jpg>:
        description: "Priority support for premium customers"
        suggestions:
          reply "Priority Chat"
          dial "Premium Line" <phone +1-800-PREMIUM>
          
    FAQ:
      carousel :small:
        richCard "Getting Started":
          description: "New to our service?"
        richCard "Troubleshooting": 
          description: "Common issues and solutions"
        richCard "Advanced Features":
          description: "Pro tips and tricks"
          
    Collect Info:
      text "Please describe your issue:"
        suggestions:
          reply "Login Problem"
          reply "Payment Failed"
          reply "Feature Request"
          shareLocation "Send Location"
          
    Route To Agent:
      text "Connecting you to a specialist..."
      
  flow Error Handling:
    when error.type is "timeout":
      :start -> Timeout Message
      
    when error.type is "unavailable":
      :start -> Unavailable Message
      
  messages Error Messages:
    Timeout Message:
      text "Sorry, our agents are busy. Please try again later."
        suggestions:
          reply "Try Again"
          reply "Leave Message"
          
    Unavailable Message:
      text "Support is currently unavailable. Our hours are 9 AM - 5 PM EST."`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.ast?.imports).toHaveLength(1);
      expect(result.ast?.agentDefinition?.name).toBe('Comprehensive Support Agent');
      expect(result.ast?.agentDefinition?.displayName).toBe('Comprehensive Support');
      expect(result.ast?.agentDefinition?.brandName).toBe('ACME Corporation');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Section 8: Message Shortcut Examples (Lines 497-563)', () => {
    test('All Message Shortcuts', () => {
      const input = `agent Test:
  displayName: "Test Agent"
  
  messages Messages:
    # Text shortcuts
    Simple:
      text "Simple message"
      
    WithSuggestions:
      text "Message with suggestions"
        suggestions:
          reply "Option 1"
          reply "Option 2"
          
    # Rich card shortcuts
    ProductCard:
      richCard "Amazing Product" :horizontal :left :medium <url https://example.com/product.jpg>:
        description: "Check out our latest product"
        suggestions:
          reply "Buy Now"
          openUrl "Learn More" <url https://example.com/product>
          
    # Carousel shortcuts
    ProductCatalog:
      carousel :small:
        richCard "Product 1":
          description: "First product"
        richCard "Product 2":
          description: "Second product"
        richCard "Product 3":
          description: "Third product"
          
    # File shortcuts
    Document:
      rbmFile <url https://example.com/document.pdf>
      
    Image:
      file <url https://example.com/image.png>
      
    # Action shortcuts in suggestions
    ActionExamples:
      text "Choose an action:"
        suggestions:
          reply "Text Reply"
          dial "Call Us" <phone +1-555-0123>
          openUrl "Visit Website" <url https://example.com>
          shareLocation "Share Location"
          viewLocation "View Store" <zip 10001>
          saveEvent "Add to Calendar" <datetime 2024-03-15T14:30:00>
          
    # Message traffic types
    TransactionalMessage:
      transactional text "Your order has been confirmed"
      
    PromotionalMessage:
      promotional richCard "Special Offer":
        description: "Limited time discount!"
        
  flow Main:
    :start -> Simple`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Complex Real-World Examples', () => {
    test('E-commerce Support Agent', () => {
      const input = `import Shared / E-commerce / Order Utils
import Payment / Gateway as PaymentGateway

agent E-commerce Support:
  displayName: "E-commerce Support Bot"
  brandName: "ShopMart"
  
  agentConfig Config:
    description: "Customer support for online shopping"
    supportedCurrencies: ("USD", "EUR", "GBP")
    businessHours: "9 AM - 6 PM EST"
    
  agentDefaults Defaults:
    messageTrafficType: :transactional
    
  flow Customer Support:
    :start -> Welcome -> Main Menu
    
    Main Menu -> Order Status when user.inquiry is "order"
    Main Menu -> Payment Help when user.inquiry is "payment"
    Main Menu -> Returns when user.inquiry is "return"
    
    Order Status -> Order Details with:
      orderId: \$js> extractOrderId(user.message)
      
    Payment Help -> Payment Options
    Returns -> Return Policy
    
  flow Order Management:
    :start -> Verify Customer -> Process Request
    
    Process Request with:
      customerId: \$js> user.id
      requestType: \$js> classifyRequest(user.message)
      
  messages Customer Messages:
    Welcome:
      text "Welcome to ShopMart Support! How can we help you today?"
        suggestions:
          reply "Track Order"
          reply "Payment Issue"
          reply "Return Item"
          reply "General Question"
          
    Main Menu:
      richCard "Support Options" :vertical :center :medium <url https://shopmart.com/support-icon.png>:
        description: "What do you need help with?"
        suggestions:
          reply "Order Status"
          reply "Payment Problems"
          reply "Returns & Exchanges"
          openUrl "Help Center" <url https://shopmart.com/help>
          dial "Call Support" <phone +1-800-SHOP>
          
    Order Status:
      text "I'll help you track your order. Please provide your order number:"
        suggestions:
          reply "I don't have it"
          reply "Email me the details"
          
    Order Details:
      transactional text \$js> \`Your order #\${orderId} is \${orderStatus}\`
        suggestions:
          reply "Cancel Order" when \$js> canCancel(orderStatus)
          reply "Change Address" when \$js> canChangeAddress(orderStatus)
          openUrl "Track Package" <url \$js> getTrackingUrl(orderId)>
          
    Payment Help:
      text "What payment issue are you experiencing?"
        suggestions:
          reply "Payment Declined"
          reply "Refund Status"
          reply "Update Card"
          reply "Billing Question"
          
    Payment Options:
      carousel :medium:
        richCard "Credit Cards":
          description: "Visa, MasterCard, Amex accepted"
        richCard "Digital Wallets":
          description: "PayPal, Apple Pay, Google Pay"
        richCard "Bank Transfer":
          description: "Direct bank transfer options"
          
    Returns:
      text "I can help with returns and exchanges:"
        suggestions:
          reply "Start Return"
          reply "Return Status"
          reply "Exchange Item"
          openUrl "Return Policy" <url https://shopmart.com/returns>
          
    Return Policy:
      richCard "Return Information" :horizontal :left :large <url https://shopmart.com/return-icon.png>:
        description: "30-day return policy on most items"
        suggestions:
          reply "Print Return Label"
          reply "Schedule Pickup"
          dial "Return Specialist" <phone +1-800-RETURNS>
          
  messages Order Messages:
    Verify Customer:
      text "To protect your privacy, please verify your account:"
        suggestions:
          reply "Last 4 digits of card"
          reply "Billing ZIP code"
          reply "Phone number on file"
          
    Process Request:
      text \$js>>>
        const requestTypes = {
          'cancel': 'Processing your cancellation request...',
          'modify': 'Looking up modification options...',
          'track': 'Retrieving tracking information...'
        };
        return requestTypes[requestType] || 'Processing your request...';
        
  flow Error Handling:
    when error.type is "order_not_found":
      :start -> Order Not Found
      
    when error.type is "payment_failed":
      :start -> Payment Error
      
  messages Error Messages:
    Order Not Found:
      text "I couldn't find that order number. Let me help you locate it:"
        suggestions:
          reply "Check email for order"
          reply "Try different number"
          dial "Speak to agent" <phone +1-800-SHOP>
          
    Payment Error:
      promotional text "There was an issue processing your payment:"
        suggestions:
          reply "Try different card"
          reply "Contact bank"
          openUrl "Payment Help" <url https://shopmart.com/payment-help>`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.ast?.imports).toHaveLength(2);
      expect(result.ast?.agentDefinition?.name).toBe('E-commerce Support');
      expect(result.errors).toHaveLength(0);
    });
  });
});