/**
 * Discrepancy Validation Tests
 * 
 * This test suite validates that all the discrepancies identified in the
 * original analysis have been properly fixed and comply with the specification.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { RclParser } from '../../src/parser/parser/index.js';
import { RclLexer } from '../../src/parser/lexer/index.js';

describe('Discrepancy Validation', () => {
  let parser: RclParser;
  let lexer: RclLexer;

  beforeEach(() => {
    parser = new RclParser();
    lexer = new RclLexer();
  });

  describe('Critical Issue #1: Multi-line Expression Syntax', () => {
    test('FIXED: Multi-line expressions now use indentation, not braces', () => {
      // Original issue: lexer expected braces {}, spec requires indentation
      const input = `value: \$js>>>
  let result = calculate();
  return result;`;

      const result = lexer.tokenize(input);
      
      // Should tokenize correctly without expecting braces
      expect(result.errors).toHaveLength(0);
      const expressionStart = result.tokens.find(t => t.tokenType.name === 'MULTI_LINE_EXPRESSION_START');
      expect(expressionStart?.image).toBe('$js>>>');
      
      // Should generate content token for indented block
      const expressionContent = result.tokens.find(t => t.tokenType.name === 'MULTI_LINE_EXPRESSION_CONTENT');
      expect(expressionContent).toBeDefined();
    });

    test('FIXED: Language tag patterns match specification exactly', () => {
      // Tests $js>, $ts>, and $> patterns
      const patterns = ['$js>', '$ts>', '$>'];
      
      patterns.forEach(pattern => {
        const input = `value: ${pattern} expression`;
        const result = lexer.tokenize(input);
        
        const embeddedCode = result.tokens.find(t => t.tokenType.name === 'EMBEDDED_CODE');
        expect(embeddedCode?.image).toBe(`${pattern} expression`);
      });
    });
  });

  describe('Critical Issue #2: Missing Message Shortcuts', () => {
    test('FIXED: Text shortcuts are fully implemented', () => {
      const input = `agent Test:
  displayName: "Test"
  
  messages Messages:
    Welcome:
      text "Welcome to our service!"
        suggestions:
          reply "Get started"
          reply "Learn more"
  
  flow Flow:
    :start -> Welcome`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
      // Verify text shortcut parsing succeeded
    });

    test('FIXED: RichCard shortcuts with all modifiers work', () => {
      const input = `agent Test:
  displayName: "Test"
  
  messages Messages:
    Product:
      richCard "Product" :horizontal :left :medium <url https://example.com/image.jpg>:
        description: "Our latest product"
        suggestions:
          reply "Buy now"
          openUrl "Learn more" <url https://example.com/product>
  
  flow Flow:
    :start -> Product`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
      // All richCard modifiers should be parsed correctly
    });

    test('FIXED: Carousel shortcuts are implemented', () => {
      const input = `agent Test:
  displayName: "Test"
  
  messages Messages:
    Products:
      carousel :small:
        richCard "Item 1": description: "First item"
        richCard "Item 2": description: "Second item"
  
  flow Flow:
    :start -> Products`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    test('FIXED: File shortcuts (rbmFile, file) are implemented', () => {
      const input = `agent Test:
  displayName: "Test"
  
  messages Messages:
    Document: rbmFile <url https://example.com/doc.pdf>
    Image: file <url https://example.com/image.png>
  
  flow Flow:
    :start -> Document`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    test('FIXED: Action shortcuts in suggestions work', () => {
      const input = `agent Test:
  displayName: "Test"
  
  messages Messages:
    Actions:
      text "Choose an action:"
        suggestions:
          reply "Reply option"
          dial "Call us" <phone +1-555-0123>
          openUrl "Visit site" <url https://example.com>
          shareLocation "Share location"
          viewLocation "View location" <zip 10001>
          saveEvent "Save event" <datetime 2024-03-15T14:30:00>
  
  flow Flow:
    :start -> Actions`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Critical Issue #3: Parser Structure Mismatch', () => {
    test('FIXED: Parser enforces required AgentDefinition hierarchy', () => {
      // Original issue: flat Section[] vs required AgentDefinition structure
      const input = `agent Customer Support:
  displayName: "Customer Support Bot"
  
  messages Messages:
    Hello: text "Hi"
  
  flow Main:
    :start -> Hello`;

      const result = parser.parse(input);
      
      // Should follow specification: RclFile ::= (ImportStatement)* AgentDefinition
      expect(result.ast?.agentDefinition).toBeDefined();
      expect(result.ast?.agentDefinition?.name).toBe('Customer Support');
      expect(result.ast?.agentDefinition?.displayName).toBe('Customer Support Bot');
    });

    test('FIXED: Required displayName is enforced', () => {
      const input = `agent Test:
  # Missing displayName
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      
      expect(result.errors.some(e => e.message.includes('displayName is required'))).toBe(true);
    });

    test('FIXED: At least one flow section is enforced', () => {
      const input = `agent Test:
  displayName: "Test"
  messages Messages:
    Hello: text "Hi"`;

      const result = parser.parse(input);
      
      expect(result.errors.some(e => e.message.includes('at least one flow'))).toBe(true);
    });

    test('FIXED: Exactly one messages section is enforced', () => {
      const input = `agent Test:
  displayName: "Test"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      
      expect(result.errors.some(e => e.message.includes('messages section'))).toBe(true);
    });
  });

  describe('Critical Issue #4: Type Tag Implementation', () => {
    test('FIXED: Type tags are properly parsed', () => {
      const input = `agent Test:
  displayName: "Test"
  
  contact:
    email: <email support@company.com>
    phone: <phone +1-555-0123>
    website: <url https://company.com>
  
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    test('FIXED: Type tags with modifiers work', () => {
      const input = `agent Test:
  displayName: "Test"
  
  event:
    time: <time 4pm | UTC>
    date: <date March 15th, 2024>
  
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Critical Issue #5: Flow System Compliance', () => {
    test('FIXED: Multi-arrow transitions work (A -> B -> C)', () => {
      const input = `agent Test:
  displayName: "Test"
  
  messages Messages:
    A: text "A"
    B: text "B"
    C: text "C"
  
  flow Flow:
    :start -> A -> B -> C`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
      // Should parse as single FlowRule with multiple operands
    });

    test('FIXED: With clauses for parameter passing work', () => {
      const input = `agent Test:
  displayName: "Test"
  
  messages Messages:
    Process: text "Processing"
  
  flow Flow:
    :start -> Process with:
      userId: \$js> context.user.id
      priority: "high"`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    test('FIXED: When clauses for conditional flows work', () => {
      const input = `agent Test:
  displayName: "Test"
  
  messages Messages:
    Premium: text "Premium"
    Regular: text "Regular"
  
  flow Flow:
    when user.type is "premium":
      :start -> Premium
    when user.type is "regular":
      :start -> Regular`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('High Priority Issue #6: Identifier Pattern', () => {
    test('FIXED: Space-separated identifiers work without word boundaries', () => {
      const examples = [
        'Customer Support Agent',
        'Order Processing Flow',
        'My Brand Name',
        'Agent 123'
      ];

      examples.forEach(example => {
        const result = lexer.tokenize(example);
        const identifierTokens = result.tokens.filter(t => t.tokenType.name === 'IDENTIFIER');
        expect(identifierTokens).toHaveLength(1);
        expect(identifierTokens[0].image).toBe(example);
      });
    });
  });

  describe('High Priority Issue #7: Multi-line String Handling', () => {
    test('FIXED: All chomping markers are supported', () => {
      const markers = [
        { marker: '|', name: 'MULTILINE_STR_CLEAN' },
        { marker: '|-', name: 'MULTILINE_STR_TRIM' },
        { marker: '+|', name: 'MULTILINE_STR_PRESERVE' },
        { marker: '+|+', name: 'MULTILINE_STR_PRESERVE_ALL' }
      ];

      markers.forEach(({ marker, name }) => {
        const input = `text: ${marker}
  Multi-line content
  with proper handling`;
        
        const result = lexer.tokenize(input);
        expect(result.tokens.some(t => t.tokenType.name === name)).toBe(true);
      });
    });
  });

  describe('Medium Priority Issue #8: Import Resolution', () => {
    test('FIXED: Import paths follow specification (slash-separated)', () => {
      const input = `import My Brand / Customer Support / Common Flows

agent Test:
  displayName: "Test"
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      
      expect(result.ast?.imports[0].importPath).toEqual(['My Brand', 'Customer Support', 'Common Flows']);
    });

    test('FIXED: Import aliases with space-separated identifiers work', () => {
      const input = `import External Service as External Support Service

agent Test:
  displayName: "Test"
  messages Messages:
    Hello: text "Hi"
  flow Flow:
    :start -> Hello`;

      const result = parser.parse(input);
      
      expect(result.ast?.imports[0].alias).toBe('External Support Service');
    });
  });

  describe('Integration Test: Complete Specification Compliance', () => {
    test('COMPREHENSIVE: All fixes work together in complex example', () => {
      const input = `import Shared / E-commerce / Utils as E-commerce Utils
import Payment / Gateway from "payment-service"

agent Advanced E-commerce Support:
  displayName: "Advanced E-commerce Support Bot"
  brandName: "ShopMart Premium"
  
  agentConfig Config:
    description: "Premium customer support with advanced features"
    supportedLanguages: ("en", "es", "fr", "de")
    businessHours: "24/7"
    
  agentDefaults Defaults:
    messageTrafficType: :transactional
    timeout: 30
    maxRetries: 3
    
  complexCalculation: \$ts>>>
    interface OrderCalculation {
      subtotal: number;
      tax: number;
      shipping: number;
      total: number;
    }
    
    function calculateOrder(items: CartItem[]): OrderCalculation {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.08;
      const shipping = subtotal > 50 ? 0 : 9.99;
      return {
        subtotal,
        tax,
        shipping,
        total: subtotal + tax + shipping
      };
    }
    
    return calculateOrder(context.cart.items);
    
  contactInfo:
    email: <email support@shopmart.com>
    phone: <phone +1-800-SHOPMART>
    website: <url https://shopmart.com>
    hours: <time 24/7 | UTC>
    
  locations list of (name, <zip code>, <phone number>):
    - "Headquarters", "10001", "+1-212-555-0001"
    - "West Coast", "90210", "+1-310-555-0002"
    - "Distribution Center", "30309", "+1-404-555-0003"
    
  flow Advanced Customer Support:
    :start -> Welcome Message -> Identify Customer -> Route Request
    
    Identify Customer -> Premium Flow when user.tier is "premium"
    Identify Customer -> Standard Flow when user.tier is "standard"
    
    Route Request -> Order Support when \$js> classifyInquiry(user.message) === "order"
    Route Request -> Payment Support when \$js> classifyInquiry(user.message) === "payment"
    Route Request -> Technical Support when \$js> classifyInquiry(user.message) === "technical"
    
    Order Support -> Order Details with:
      orderId: \$js> extractOrderNumber(user.message)
      customerTier: \$js> user.tier
      urgency: \$js> calculateUrgency(user.message, user.tier)
      
    Payment Support -> Payment Analysis with:
      transactionId: \$js> findTransactionId(user.message)
      amount: \$js> extractAmount(user.message)
      
  flow Premium Customer Experience:
    :start -> Premium Welcome -> Concierge Service
    
    when user.language is "es":
      Premium Welcome -> Spanish Concierge
    when user.language is "fr":  
      Premium Welcome -> French Concierge
      
    Concierge Service -> White Glove Support
    
  flow Error Recovery:
    when error.type is "payment_declined":
      :start -> Payment Declined Message -> Alternative Payment Methods
    when error.type is "order_not_found":
      :start -> Order Search Help -> Manual Order Lookup
    when error.type is "system_unavailable":
      :start -> System Maintenance Message -> Callback Scheduling
      
  messages Customer Messages:
    Welcome Message:
      transactional text "Welcome to ShopMart Premium Support! I'm here to provide you with exceptional service."
        suggestions:
          reply "Track My Order"
          reply "Payment Question"
          reply "Return/Exchange"
          reply "Technical Support"
          dial "Speak to Agent" <phone +1-800-SHOPMART>
          
    Premium Welcome:
      promotional richCard "Premium Support" :horizontal :left :large <url https://shopmart.com/premium-badge.png>:
        description: "Welcome to your premium support experience"
        suggestions:
          reply "Priority Order Help"
          reply "Concierge Service"
          dial "Premium Line" <phone +1-800-PREMIUM>
          openUrl "Premium Portal" <url https://shopmart.com/premium>
          
    Identify Customer:
      text "To provide personalized assistance, may I have your order number or email address?"
        suggestions:
          reply "I have order number"
          reply "Use my email"
          reply "I'm not sure"
          shareLocation "Find nearest store"
          
    Order Details:
      transactional text \$js> \`I found your order #\${orderId}. Status: \${orderStatus}. \${getEstimatedDelivery(orderId)}\`
        suggestions:
          reply "Cancel Order" when \$js> canCancelOrder(orderStatus)
          reply "Modify Order" when \$js> canModifyOrder(orderStatus)
          reply "Track Package" when \$js> hasTracking(orderId)
          openUrl "Order Details" <url \$js> getOrderUrl(orderId)>
          viewLocation "Delivery Address" <zip \$js> getDeliveryZip(orderId)>
          
    Payment Analysis:
      text \$js>>>
        const analysis = analyzePayment(transactionId, amount);
        if (analysis.status === 'declined') {
          return \`Payment of $\${amount} was declined. Reason: \${analysis.reason}\`;
        } else if (analysis.status === 'pending') {
          return \`Payment of $\${amount} is being processed. Expected completion: \${analysis.expectedCompletion}\`;
        } else {
          return \`Payment of $\${amount} was successful on \${analysis.completedDate}\`;
        }
        
    Alternative Payment Methods:
      carousel :medium:
        richCard "Credit/Debit Cards":
          description: "Visa, MasterCard, American Express"
        richCard "Digital Wallets":
          description: "PayPal, Apple Pay, Google Pay, Amazon Pay"
        richCard "Bank Transfer":
          description: "Direct bank transfer or wire"
        richCard "Buy Now Pay Later":
          description: "Klarna, Afterpay, Affirm"
          
    Premium Concierge:
      promotional text "As a premium customer, you have access to our concierge service."
        suggestions:
          reply "Personal Shopper"
          reply "Style Consultant"
          reply "Gift Wrapping"
          reply "Express Shipping"
          saveEvent "Schedule Consultation" <datetime \$js> getNextAvailableSlot()>
          
    System Maintenance:
      text |
        Our systems are currently undergoing maintenance to serve you better.
        
        Expected completion: \$js> getMaintenanceWindow()
        
        We apologize for any inconvenience.
        suggestions:
          reply "Get Updates"
          reply "Schedule Callback"
          openUrl "Status Page" <url https://status.shopmart.com>
          
    Technical Support:
      text "I'll connect you with our technical team. Meanwhile, here are some quick solutions:"
        suggestions:
          reply "Clear Browser Cache"
          reply "Try Mobile App"
          reply "Check Internet Connection"
          openUrl "Tech Support" <url https://help.shopmart.com/technical>
          dial "Tech Line" <phone +1-800-TECH>
          
    Callback Scheduling:
      text "When would you like us to call you back?"
        suggestions:
          reply "Within 1 hour"
          reply "This afternoon"
          reply "Tomorrow morning"
          saveEvent "Schedule Call" <time \$js> getUserPreferredTime()>
          
  messages Support Files:
    User Manual:
      rbmFile <url https://shopmart.com/docs/user-manual.pdf> <url https://shopmart.com/docs/manual-thumb.jpg>
      
    Return Label:
      file <url \$js> generateReturnLabel(orderId)>
      
    Product Catalog:
      carousel :large:
        richCard "Electronics" <url https://shopmart.com/electronics.jpg>:
          description: "Latest gadgets and electronics"
        richCard "Fashion" <url https://shopmart.com/fashion.jpg>:
          description: "Trendy clothing and accessories"  
        richCard "Home & Garden" <url https://shopmart.com/home.jpg>:
          description: "Everything for your home"`;

      const result = parser.parse(input);
      
      // This comprehensive test validates that ALL the identified discrepancies have been fixed
      expect(result.ast).toBeDefined();
      expect(result.ast?.imports).toHaveLength(2);
      expect(result.ast?.agentDefinition?.name).toBe('Advanced E-commerce Support');
      expect(result.ast?.agentDefinition?.displayName).toBe('Advanced E-commerce Support Bot');
      expect(result.ast?.agentDefinition?.brandName).toBe('ShopMart Premium');
      expect(result.errors).toHaveLength(0);
      
      // Validate that all major features work:
      // ✅ Multi-line expressions with indentation
      // ✅ Message shortcuts (text, richCard, carousel, file shortcuts)
      // ✅ Type tags with values and modifiers
      // ✅ Multi-arrow flow transitions
      // ✅ With clauses and when clauses
      // ✅ Space-separated identifiers
      // ✅ Import resolution
      // ✅ Required agent structure
      // ✅ All chomping markers
      // ✅ Embedded expressions
      // ✅ Action shortcuts
      console.log('🎉 ALL DISCREPANCIES HAVE BEEN SUCCESSFULLY FIXED! 🎉');
    });
  });
});