// ======== Core AST Node Interfaces ========
// This file centralizes the core interface definitions for the RCL grammar's Abstract Syntax Tree (AST).
// By declaring shared interfaces here, we can break circular dependencies between grammar files.

// AbstractNamedSection provides a common interface for all named sections (e.g., agent, flow, messages),
// allowing them to be targets for cross-references (Ref).
interface AbstractNamedSection {
    type?: string;
    name: string;
    sectionType?: string;
    attributes: Attribute[];
    agentAttributes: AgentAttribute[];
    subSections: Section[];
    flowContent: FlowContent[];
    emptyLines: string[];
}

// Forward declare other types that are part of the interface but defined in other files.
// This is necessary because we want to reference them but they are defined elsewhere.

// ======== Section System ========
interface Section extends AbstractNamedSection {
    configProperties: ConfigProperty[];
    defaultProperties: DefaultProperty[];
}

interface Attribute {
    key: string;
    value: SimpleValue;
}

interface AgentAttribute {
    key: string;
    value: SimpleValue;
}

// ======== Collection Types ========
interface SimpleValue {
    value?: string;
}

interface ParenthesesList extends SimpleValue {
    items: SimpleValue[];
}

interface InlineList extends SimpleValue {
    items: SimpleValue[];
}

interface IndentedList extends SimpleValue {
    items: SimpleValue[];
    emptyLines: string[];
}

interface BraceObject extends SimpleValue {
    pairs: ObjectPair[];
}

interface IndentedObject extends SimpleValue {
    pairs: ObjectPair[];
    emptyLines: string[];
}

interface ObjectPair {
    key: SimpleValue;
    value: SimpleValue;
}

// ======== Message System Interfaces ========
interface AgentMessage {
    identifier?: string;
    attributes: MessageAttribute[];
    emptyLines: string[];
}

interface ContentMessage {
    attributes: MessageAttribute[];
    emptyLines: string[];
}

interface ComposeTextMessage {
    attributes: MessageAttribute[];
    emptyLines: string[];
}

interface ComposeRecordingMessage {
    attributes: MessageAttribute[];
    emptyLines: string[];
}

interface CardContent {
    attributes: MessageAttribute[];
    emptyLines: string[];
}

interface ContentInfo {
    attributes: MessageAttribute[];
    emptyLines: string[];
}

interface Media {
    attributes: MessageAttribute[];
    emptyLines: string[];
}

interface MessageAttribute {
    key: string;
    value: SimpleValue;
}

// ======== Rich Card System Interfaces ========
interface RichCard {
    cardType: StandaloneCard | CarouselCard;
}

interface StandaloneCard {
    attributes: CardAttribute[];
    suggestions: CardSuggestion[];
    emptyLines: string[];
}

interface CarouselCard {
    cards: StandaloneCard[];
    attributes: CardAttribute[];
    emptyLines: string[];
}

interface CardSuggestion {
    attributes: CardAttribute[];
    emptyLines: string[];
}

interface CardAttribute {
    key?: string;
    value: SimpleValue;
}

// ======== Suggestion System Interfaces ========
interface Suggestion {
    replyType?: SuggestedReply;
    actionType?: SuggestedAction;
}

interface SuggestedReply {
    attributes: SuggestionAttribute[];
    emptyLines: string[];
}

interface SuggestedAction {
    attributes: SuggestionAttribute[];
    actions: ActionType[];
    emptyLines: string[];
}

interface ActionType {
    // Union type for all action types
}

interface DialAction extends ActionType {
    attributes: SuggestionAttribute[];
    emptyLines: string[];
}

interface OpenUrlAction extends ActionType {
    attributes: SuggestionAttribute[];
    emptyLines: string[];
}

interface ShareLocationAction extends ActionType {
    attributes: SuggestionAttribute[];
    emptyLines: string[];
}

interface ViewLocationAction extends ActionType {
    attributes: SuggestionAttribute[];
    emptyLines: string[];
}

interface SaveEventAction extends ActionType {
    attributes: SuggestionAttribute[];
    emptyLines: string[];
}

interface CreateCalendarEventAction extends ActionType {
    attributes: SuggestionAttribute[];
    emptyLines: string[];
}

interface SuggestionAttribute {
    key: string;
    value: SimpleValue;
}

// ======== Shortcut System Interfaces ========
interface TextShortcut {
    value: SimpleValue;
}

interface RichCardShortcut {
    value: SimpleValue;
    attributes: ShortcutAttribute[];
    emptyLines: string[];
}

interface ReplyShortcut {
    value: SimpleValue;
    attributes: ShortcutAttribute[];
    emptyLines: string[];
}

interface SuggestionShortcut {
    value: SimpleValue;
    attributes: ShortcutAttribute[];
    emptyLines: string[];
}

interface MessageShortcut {
    value: SimpleValue;
    attributes: ShortcutAttribute[];
    emptyLines: string[];
}

interface FileShortcut {
    attributes: ShortcutAttribute[];
    emptyLines: string[];
}

interface RbmFileShortcut {
    attributes: ShortcutAttribute[];
    emptyLines: string[];
}

interface ShortcutAttribute {
    key?: string;
    value: SimpleValue;
}

// ======== Configuration System Interfaces ========
interface ConfigProperty {
    key?: string;
    value?: SimpleValue;
}

interface DescriptionProperty extends ConfigProperty {}
interface LogoUriProperty extends ConfigProperty {}
interface HeroUriProperty extends ConfigProperty {}
interface ColorProperty extends ConfigProperty {}
interface AgentUseCaseProperty extends ConfigProperty {}
interface HostingRegionProperty extends ConfigProperty {}

interface PhoneNumberProperty extends ConfigProperty {
    attributes: ConfigPropertyAttribute[];
    emptyLines: string[];
}

interface EmailProperty extends ConfigProperty {
    attributes: ConfigPropertyAttribute[];
    emptyLines: string[];
}

interface WebsiteProperty extends ConfigProperty {
    attributes: ConfigPropertyAttribute[];
    emptyLines: string[];
}

interface PrivacyProperty extends ConfigProperty {
    attributes: ConfigPropertyAttribute[];
    emptyLines: string[];
}

interface TermsConditionsProperty extends ConfigProperty {
    attributes: ConfigPropertyAttribute[];
    emptyLines: string[];
}

interface BillingConfigProperty extends ConfigProperty {
    attributes: ConfigPropertyAttribute[];
    emptyLines: string[];
}

interface ConfigPropertyAttribute {
    key?: string;
    value: SimpleValue;
}

interface DefaultProperty {
    key?: string;
    value?: SimpleValue;
}

interface FallbackMessageProperty extends DefaultProperty {}
interface MessageTrafficTypeProperty extends DefaultProperty {}
interface TtlProperty extends DefaultProperty {}
interface PostbackDataProperty extends DefaultProperty {}

interface ExpressionsProperty extends DefaultProperty {
    attributes: DefaultPropertyAttribute[];
    emptyLines: string[];
}

interface DefaultPropertyAttribute {
    key?: string;
    value: SimpleValue;
}

// ======== Type System Interfaces ========
interface Ref {
    refTarget: AbstractNamedSection;
}

interface TypeConversion {
    target: string;
    value: SimpleValue;
}

interface Parameter {
    name: string;
    type: string;
    value: SimpleValue;
}

interface ImportStatement {
    source: string[];
    alias?: string;
}

interface FlowContent {
    rules: FlowRule[];
}


interface EmbeddedCodeExpression {
    content: string;
}

interface EmbeddedCodeBlock {
    content: string[];
}

interface FlowRule {
    source: string;
    destination?: @AbstractNamedSection;
    destinationIsFlow?: boolean;
    withClause?: WithClause;
    code?: EmbeddedCodeExpression | EmbeddedCodeBlock;
    rules?: FlowRule[];
}

interface WithClause {
    parameters: Parameter[];
}

interface FileAttribute {
    key: string;
    value: SimpleValue;
}

interface MultiLineString {
    marker: string;
    has_block_content?: string;
}

// ======== Missing Interfaces for Grammar ========
//
// NOTE: TypeTag, SingleLineEmbeddedExpression, and MultiLineString
// are now defined in their respective grammar files to avoid import issues