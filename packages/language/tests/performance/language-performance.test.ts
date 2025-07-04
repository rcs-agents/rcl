import { describe, test, expect, beforeAll } from 'vitest';
import { RclParser } from '../../src/parser/parser/index.js';
import { RclLexer } from '../../src/parser/lexer/index.js';
import { EmptyFileSystem } from 'langium';
import { createRclServices } from '../../src/rcl-module.js';

describe('RCL Language Performance Tests', () => {
  let parser: RclParser;
  let lexer: RclLexer;
  let services: ReturnType<typeof createRclServices>;

  beforeAll(() => {
    parser = new RclParser();
    lexer = new RclLexer();
    services = createRclServices(EmptyFileSystem);
  });

  describe('Parser Performance', () => {
    test('parses large RCL files efficiently', () => {
      const startTime = performance.now();
      
      // Generate a large but realistic RCL file
      const largeSections = [];
      for (let i = 0; i < 50; i++) {
        largeSections.push(`agent Customer Support Agent ${i}:
    name: "Customer Support Agent ${i}"
    displayName: "Support Agent ${i}"
    version: "2.${i}.0"
    enabled: True
    timeout: ${30 + i}
    maxSessions: ${100 + i * 10}
    
    config:
        webhookUrl: "https://api.company.com/webhook/${i}"
        environment: :PRODUCTION
        debugMode: False
        apiKey: "key_${i}_secure"
        retryCount: ${3 + (i % 5)}
        
    defaults:
        responseTime: ${5 + (i % 10)}
        priority: :HIGH
        language: "en-US"
        theme: "modern"
        
    flow Support Flow ${i}:
        description: "Customer support workflow ${i}"
        priority: :HIGH
        timeout: ${60 + i}
        :start -> welcome_${i}
        welcome_${i} -> gather_info_${i}
        gather_info_${i} -> process_request_${i}
        process_request_${i} -> response_${i}
        response_${i} -> :end
        :error -> error_handler_${i}
        error_handler_${i} -> :retry
        :timeout -> timeout_message_${i}
        
    messages Support Messages ${i}:
        welcome_${i}:
            text: "Welcome to Customer Support ${i}"
            type: "greeting"
            priority: 1
            category: "support"
            
        gather_info_${i}:
            text: "Please provide your information for case ${i}"
            validationRequired: True
            timeout: 30
            retryCount: 3
            
        process_request_${i}:
            text: "Processing your request ${i}..."
            type: "status"
            showProgress: True
            
        response_${i}:
            text: "Thank you for contacting support ${i}"
            type: "response"
            priority: 2
            
        error_handler_${i}:
            text: "An error occurred in process ${i}"
            type: "error"
            logLevel: :ERROR
            
        timeout_message_${i}:
            text: "Request timeout for process ${i}"
            type: "timeout"
            retryable: True`);
      }
      
      const largeInput = largeSections.join('\n\n');
      
      const result = parser.parse(largeInput);
      const endTime = performance.now();
      
      const parsingTime = endTime - startTime;
      
      // Should parse large file efficiently (less than 2 seconds for 50 agents)
      expect(parsingTime).toBeLessThan(2000);
      
      // Should successfully parse the content
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      expect(result.ast!.sections).toHaveLength(250); // 50 agents * 5 sections each
      
      console.log(`Parsed ${largeSections.length} agents (${largeInput.length} characters) in ${parsingTime.toFixed(2)}ms`);
    });

    test('handles deeply nested structures efficiently', () => {
      const startTime = performance.now();
      
      // Create deeply nested configuration
      const deepInput = `agent Deep Configuration Agent:
    name: "Deep Config Test"
    
    config:
        level1:
            level2:
                level3:
                    level4:
                        level5:
                            level6:
                                level7:
                                    level8:
                                        level9:
                                            level10:
                                                deepValue: "Very deep value"
                                                deepNumber: 42
                                                deepBoolean: True
                                            level10b:
                                                anotherDeep: "Another deep value"
                                        level9b:
                                            value: "Level 9b value"
                                    level8b:
                                        value: "Level 8b value"
                                level7b:
                                    value: "Level 7b value"
                            level6b:
                                value: "Level 6b value"
                        level5b:
                            value: "Level 5b value"
                    level4b:
                        value: "Level 4b value"
                level3b:
                    value: "Level 3b value"
            level2b:
                value: "Level 2b value"
        level1b:
            value: "Level 1b value"`;
      
      const result = parser.parse(deepInput);
      const endTime = performance.now();
      
      const parsingTime = endTime - startTime;
      
      // Should handle deep nesting efficiently (less than 500ms)
      expect(parsingTime).toBeLessThan(500);
      
      // Should parse successfully despite depth
      expect(result.ast).toBeDefined();
      expect(result.ast!.sections.length).toBeGreaterThan(0);
      
      console.log(`Parsed deeply nested structure in ${parsingTime.toFixed(2)}ms`);
    });

    test('processes many flow rules efficiently', () => {
      const startTime = performance.now();
      
      // Generate a complex flow with many rules
      const flowRules = [];
      for (let i = 0; i < 100; i++) {
        flowRules.push(`        state_${i} -> state_${i + 1}`);
      }
      flowRules.push(`        state_100 -> :end`);
      
      const complexFlowInput = `agent Complex Flow Agent:
    name: "Complex Flow Test"
    
    flow Complex Flow:
        description: "Flow with many states"
        :start -> state_0
${flowRules.join('\n')}
        :error -> error_state
        error_state -> :retry`;
      
      const result = parser.parse(complexFlowInput);
      const endTime = performance.now();
      
      const parsingTime = endTime - startTime;
      
      // Should handle many flow rules efficiently
      expect(parsingTime).toBeLessThan(1000);
      
      expect(result.ast).toBeDefined();
      const flowSection = result.ast!.sections.find(s => s.sectionType === 'flow');
      expect(flowSection).toBeDefined();
      expect(flowSection!.flowRules.length).toBeGreaterThan(100);
      
      console.log(`Parsed ${flowRules.length + 2} flow rules in ${parsingTime.toFixed(2)}ms`);
    });
  });

  describe('Lexer Performance', () => {
    test('tokenizes large files efficiently', () => {
      const startTime = performance.now();
      
      // Generate large input with various token types
      const largeTokenInput = Array(1000).fill(0).map((_, i) => 
        `agent Test${i}: name: "Test Agent ${i}" version: "1.${i}" enabled: True`
      ).join('\n');
      
      const lexResult = lexer.tokenize(largeTokenInput);
      const endTime = performance.now();
      
      const lexingTime = endTime - startTime;
      
      // Should tokenize efficiently (less than 1 second for large input)
      expect(lexingTime).toBeLessThan(1000);
      
      // Should produce many tokens without errors
      expect(lexResult.errors).toHaveLength(0);
      expect(lexResult.tokens.length).toBeGreaterThan(5000);
      
      console.log(`Tokenized ${largeTokenInput.length} characters (${lexResult.tokens.length} tokens) in ${lexingTime.toFixed(2)}ms`);
    });

    test('handles complex token patterns efficiently', () => {
      const startTime = performance.now();
      
      const complexInput = `import Very/Long/Namespace/Path/To/Module as VeryLongAliasName
import Another/Complex/Path/With/Many/Segments as AnotherLongAlias

agent Complex Token Agent:
    name: "Agent with complex tokens"
    complexIdentifier: some_very_long_identifier_with_underscores
    unicodeProperty: "Unicode content: ñáéíóú 中文 русский 🚀"
    urlProperty: "https://very-long-domain-name.example.com/api/v1/endpoints/complex-path"
    atomValue: :VERY_LONG_ATOM_WITH_UNDERSCORES_AND_NUMBERS_123
    numberValue: 123.456789012345
    complexString: "String with \\"escaped quotes\\" and \\n newlines and \\t tabs"`;
      
      const lexResult = lexer.tokenize(complexInput);
      const endTime = performance.now();
      
      const lexingTime = endTime - startTime;
      
      // Should handle complex patterns efficiently
      expect(lexingTime).toBeLessThan(100);
      
      expect(lexResult.errors).toHaveLength(0);
      expect(lexResult.tokens.length).toBeGreaterThan(20);
      
      console.log(`Tokenized complex patterns in ${lexingTime.toFixed(2)}ms`);
    });
  });

  describe('LSP Performance', () => {
    test('provides completion quickly for large files', async () => {
      // This would test LSP completion performance but requires more setup
      // For now, we'll test basic service creation performance
      const startTime = performance.now();
      
      const testServices = createRclServices(EmptyFileSystem);
      const endTime = performance.now();
      
      const serviceCreationTime = endTime - startTime;
      
      // Service creation should be fast
      expect(serviceCreationTime).toBeLessThan(100);
      expect(testServices).toBeDefined();
      
      console.log(`Created RCL services in ${serviceCreationTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage', () => {
    test('maintains reasonable memory usage for large ASTs', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Parse multiple large files
      const asts = [];
      for (let i = 0; i < 10; i++) {
        const largeSections = [];
        for (let j = 0; j < 20; j++) {
          largeSections.push(`agent Test Agent ${i}_${j}:
    name: "Test Agent ${i}_${j}"
    version: "1.${j}"
    enabled: True
    
    config:
        timeout: ${30 + j}
        retryCount: ${3 + j}
        
    messages:
        message_${j}:
            text: "Message ${j} for agent ${i}"
            priority: ${j % 5}`);
        }
        
        const input = largeSections.join('\n\n');
        const result = parser.parse(input);
        asts.push(result.ast);
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB for 10 large ASTs)
      const memoryIncreaseInMB = memoryIncrease / (1024 * 1024);
      expect(memoryIncreaseInMB).toBeLessThan(50);
      
      // All ASTs should be parsed successfully
      expect(asts.length).toBe(10);
      expect(asts.every(ast => ast !== undefined)).toBe(true);
      
      console.log(`Memory increase: ${memoryIncreaseInMB.toFixed(2)}MB for 10 large ASTs`);
    });
  });

  describe('Stress Tests', () => {
    test('handles malformed input without performance degradation', () => {
      const startTime = performance.now();
      
      // Create input with many syntax errors
      const malformedInput = Array(100).fill(0).map((_, i) => `
agent Invalid ${i}
    missing colon
    invalid: syntax here
    another error line
    valid: "This should work"
invalid syntax at root level
more invalid content
`).join('\n');
      
      const result = parser.parse(malformedInput);
      const endTime = performance.now();
      
      const parsingTime = endTime - startTime;
      
      // Should handle malformed input without excessive slowdown
      expect(parsingTime).toBeLessThan(3000);
      
      // Should have many errors but still produce some AST
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      console.log(`Processed malformed input with ${result.errors.length} errors in ${parsingTime.toFixed(2)}ms`);
    });

    test('handles extremely long lines efficiently', () => {
      const startTime = performance.now();
      
      // Create very long string values
      const longString = 'a'.repeat(10000);
      const longIdentifier = 'identifier_' + 'part_'.repeat(1000);
      
      const longLineInput = `agent Long Line Test:
    name: "Test"
    veryLongString: "${longString}"
    veryLongIdentifier: ${longIdentifier}
    normalProperty: "Normal value"`;
      
      const result = parser.parse(longLineInput);
      const endTime = performance.now();
      
      const parsingTime = endTime - startTime;
      
      // Should handle long lines efficiently
      expect(parsingTime).toBeLessThan(500);
      
      expect(result.ast).toBeDefined();
      expect(result.ast!.sections.length).toBeGreaterThan(0);
      
      console.log(`Parsed extremely long lines in ${parsingTime.toFixed(2)}ms`);
    });

    test('handles rapid successive parsing calls', () => {
      const startTime = performance.now();
      
      const smallInput = `agent Quick Test:
    name: "Quick Test"
    enabled: True`;
      
      // Parse the same input many times rapidly
      const results = [];
      for (let i = 0; i < 1000; i++) {
        const result = parser.parse(smallInput);
        results.push(result);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 1000;
      
      // Average parse time should be very fast for small inputs
      expect(avgTime).toBeLessThan(1); // Less than 1ms per parse
      
      // All parses should succeed
      expect(results.length).toBe(1000);
      expect(results.every(r => r.ast !== undefined)).toBe(true);
      expect(results.every(r => r.errors.length === 0)).toBe(true);
      
      console.log(`1000 rapid parses completed in ${totalTime.toFixed(2)}ms (avg: ${avgTime.toFixed(3)}ms per parse)`);
    });
  });

  describe('Scaling Characteristics', () => {
    test('parsing time scales linearly with file size', () => {
      const baseSizes = [10, 50, 100, 200];
      const times = [];
      
      for (const size of baseSizes) {
        const sections = [];
        for (let i = 0; i < size; i++) {
          sections.push(`agent Scale Test ${i}:
    name: "Scale Test ${i}"
    version: "1.0"
    enabled: True`);
        }
        
        const input = sections.join('\n\n');
        
        const startTime = performance.now();
        const result = parser.parse(input);
        const endTime = performance.now();
        
        const parseTime = endTime - startTime;
        times.push({ size, time: parseTime });
        
        expect(result.ast).toBeDefined();
        expect(result.errors).toHaveLength(0);
      }
      
      // Check that scaling is reasonable (not exponential)
      const timeRatios = [];
      for (let i = 1; i < times.length; i++) {
        const sizeRatio = times[i].size / times[i-1].size;
        const timeRatio = times[i].time / times[i-1].time;
        timeRatios.push(timeRatio / sizeRatio);
      }
      
      // Time ratio should not significantly exceed size ratio (linear scaling)
      const avgRatio = timeRatios.reduce((sum, ratio) => sum + ratio, 0) / timeRatios.length;
      expect(avgRatio).toBeLessThan(3); // Allow some overhead but not exponential
      
      console.log('Scaling analysis:', times.map(t => `${t.size} sections: ${t.time.toFixed(2)}ms`).join(', '));
      console.log(`Average time/size ratio: ${avgRatio.toFixed(2)}`);
    });
  });
});