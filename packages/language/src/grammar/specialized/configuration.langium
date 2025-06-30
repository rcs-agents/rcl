// ======== Configuration System Grammar ========
// This file implements the specialized configuration property structures for Config and Defaults sections

import "../core/ast-nodes";
import "../core/primitives";
import "../data-types/collections";

// ======== Config Property Parser Rules ========
// NOTE: Using terminal-first design due to Langium limitations
// All ConfigProperty types must use only terminals and literals

ConfigProperty returns ConfigProperty:
    DescriptionProperty
    | LogoUriProperty  
    | HeroUriProperty
    | ColorProperty
    | AgentUseCaseProperty
    | HostingRegionProperty
    | PhoneNumberProperty
    | EmailProperty
    | WebsiteProperty  
    | PrivacyProperty
    | TermsConditionsProperty
    | BillingConfigProperty;

// ======== Simple Config Properties ========
DescriptionProperty returns DescriptionProperty:
    {DescriptionProperty} key='description' ':' __ value=SimpleValue;

LogoUriProperty returns LogoUriProperty:
    {LogoUriProperty} key='logoUri' ':' __ value=SimpleValue;

HeroUriProperty returns HeroUriProperty:
    {HeroUriProperty} key='heroUri' ':' __ value=SimpleValue;

ColorProperty returns ColorProperty:
    {ColorProperty} key='color' ':' __ value=SimpleValue;

AgentUseCaseProperty returns AgentUseCaseProperty:
    {AgentUseCaseProperty} key='agentUseCase' ':' __ value=SimpleValue;

HostingRegionProperty returns HostingRegionProperty:
    {HostingRegionProperty} key='hostingRegion' ':' __ value=SimpleValue;

// ======== Complex Config Properties ========
PhoneNumberProperty returns PhoneNumberProperty:
    {PhoneNumberProperty} key='phoneNumberEntry'
    NL?
    INDENT
    (attributes+=ConfigPropertyAttribute | emptyLines+=EmptyLine)*
    DEDENT;

EmailProperty returns EmailProperty:
    {EmailProperty} key='emailEntry'
    NL?
    INDENT
    (attributes+=ConfigPropertyAttribute | emptyLines+=EmptyLine)*
    DEDENT;

WebsiteProperty returns WebsiteProperty:
    {WebsiteProperty} key='websiteEntry'
    NL?
    INDENT
    (attributes+=ConfigPropertyAttribute | emptyLines+=EmptyLine)*
    DEDENT;

PrivacyProperty returns PrivacyProperty:
    {PrivacyProperty} key='privacy'
    NL?
    INDENT
    (attributes+=ConfigPropertyAttribute | emptyLines+=EmptyLine)*
    DEDENT;

TermsConditionsProperty returns TermsConditionsProperty:
    {TermsConditionsProperty} key='termsConditions'
    NL?
    INDENT
    (attributes+=ConfigPropertyAttribute | emptyLines+=EmptyLine)*
    DEDENT;

BillingConfigProperty returns BillingConfigProperty:
    {BillingConfigProperty} key='billingConfig'
    NL?
    INDENT
    (attributes+=ConfigPropertyAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// ======== Config Property Attributes ========
ConfigPropertyAttribute returns ConfigPropertyAttribute:
    {ConfigPropertyAttribute} key=('number' | 'address' | 'url' | 'label' | 'billingCategory') ':' __ value=SimpleValue;

// ======== Default Property Parser Rules ========
DefaultProperty returns DefaultProperty:
    FallbackMessageProperty
    | MessageTrafficTypeProperty
    | TtlProperty
    | PostbackDataProperty
    | ExpressionsProperty;

// ======== Simple Default Properties ========
FallbackMessageProperty returns FallbackMessageProperty:
    {FallbackMessageProperty} key='fallback_message' ':' __ value=SimpleValue;

MessageTrafficTypeProperty returns MessageTrafficTypeProperty:
    {MessageTrafficTypeProperty} key='messageTrafficType' ':' __ value=SimpleValue;

TtlProperty returns TtlProperty:
    {TtlProperty} key='ttl' ':' __ value=SimpleValue;

PostbackDataProperty returns PostbackDataProperty:
    {PostbackDataProperty} key='postbackData' ':' __ value=SimpleValue;

// ======== Complex Default Properties ========
ExpressionsProperty returns ExpressionsProperty:
    {ExpressionsProperty} key='expressions'
    NL?
    INDENT
    (attributes+=DefaultPropertyAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// ======== Default Property Attributes ========
DefaultPropertyAttribute returns DefaultPropertyAttribute:
    {DefaultPropertyAttribute} key='language' ':' __ value=SimpleValue; 