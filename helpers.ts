import { COMMAND_TYPES } from "./config";
import { CommandType } from "./types";

export function isCommandType(value: string): value is CommandType {
    return (COMMAND_TYPES as readonly string[]).includes(value);
}
