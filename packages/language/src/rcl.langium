grammar Rcl

// ======== Common Terminals and Imports ========
// This file contains common terminals and imports all necessary data-types and schema files

// Import all data-types
import "./grammar/data-types/primitives";
import "./grammar/data-types/type-system";
import "./grammar/data-types/collections";
import "./grammar/data-types/parameters";

// Import all schemas
import "./grammar/schemas/agent-schema";
import "./grammar/schemas/config-schema";
import "./grammar/schemas/defaults-schema";
import "./grammar/schemas/message-schema";
import "./grammar/schemas/flow-schema";

// Import expressions
import "./grammar/expressions/expression-types";

// Import specialized
import "./grammar/specialized/strings";
import "./grammar/specialized/embedded-code";

// Dummy infers Dummy: INDENT sign='+' DEDENT;

entry RclFile infers RclFile:
    (imports+=ImportStatement)+
    agentDefinition=AgentDefinition;