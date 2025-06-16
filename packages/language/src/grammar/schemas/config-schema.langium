// ======== Configuration Schema Interfaces and Types ========
// This file contains configuration interfaces and types
// that map to the RCS agent configuration specification

import "../data-types/primitives";
import "../data-types/type-system";
import "../data-types/collections";

// ======== AST Interface Definitions ========
interface ConfigDefinition {
    elements: ConfigElement[];
}

interface PhoneNumberEntry {
    number: TypedValue;
    label?: LiteralValue;
}

interface EmailEntry {
    address: TypedValue;
    label?: LiteralValue;
}

interface WebsiteEntry {
    url: TypedValue;
    label?: LiteralValue;
}

interface BillingConfig {
    billingCategory: string;
}

interface PartnerEntry {
    partnerId?: string;
    displayName?: string;
    company?: string;
}

// ======== Rule Fragments for Reusable Patterns ========

/**
 * Fragment for label property common to many entries
 */
fragment LabelProperty:
    ('label' ':' label=LiteralValue);

// ======== Individual Entry Definitions (Schema-Compliant) ========

// --- PhoneEntry (matches JSON schema) ---
PhoneNumberEntryDefinition returns PhoneNumberEntry:
    'phoneEntry'
    INDENT
        ('number' ':' number=TypedValue) ('label' ':' label=LiteralValue)?
        | ('label' ':' label=LiteralValue)? ('number' ':' number=TypedValue)
    DEDENT;

// --- EmailEntry (matches JSON schema) ---
EmailEntryDefinition returns EmailEntry:
    'emailEntry'
    INDENT
        ('address' ':' address=TypedValue) ('label' ':' label=LiteralValue)?
        | ('label' ':' label=LiteralValue)? ('address' ':' address=TypedValue) 
    DEDENT;

// --- WebEntry (matches JSON schema) ---
WebsiteEntryDefinition returns WebsiteEntry:
    'websiteEntry'
    INDENT
        ('url' ':' url=TypedValue) ('label' ':' label=LiteralValue)?
        | ('label' ':' label=LiteralValue)? ('url' ':' url=TypedValue)
    DEDENT;

// --- BillingConfig (matches JSON schema) ---
BillingConfigDefinition returns BillingConfig:
    'billingConfig'
    INDENT
        ('billingCategory' ':' billingCategory=ATOM)
    DEDENT;

// ======== Main Config Section Elements & Definition ========

ConfigElement:
    ('description' ':' description=STRING)
    | ('logoUri' ':' logoUri=STRING)
    | ('heroUri' ':' heroUri=STRING)
    | ('phoneNumbers' phoneNumbers=List) 
    | ('emails' emails=List)             
    | ('websites' websites=List)         
    | ('privacy' privacy=WebsiteEntryDefinition)      
    | ('termsConditions' termsConditions=WebsiteEntryDefinition) 
    | ('color' ':' color=STRING)
    | billingConfig=BillingConfigDefinition
    | ('agentUseCase' ':' agentUseCase=ATOM)
    | ('hostingRegion' ':' hostingRegion=ATOM)
    | partner=PartnerEntryDefinition;

// Partner entry - simplified to avoid conflicts
PartnerEntryDefinition returns PartnerEntry:
    'partner'
    INDENT
        ('partnerId' ':' partnerId=STRING)
        ('displayName' ':' displayName=STRING)?
        ('company' ':' company=STRING)?
    DEDENT;

ConfigDefinition returns ConfigDefinition:
    (AGENT_CONFIG_PREFIX)? 'Config' 
    INDENT
        (elements+=ConfigElement)+
    DEDENT; 