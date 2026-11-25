package com.findstay.shared.validation;

/** Character checks shared by the S1-06-T3 constraints. */
final class TextRules {

    private TextRules() {
    }

    /** True for ASCII control characters (U+0000–U+001F and U+007F), including tab and line breaks. */
    static boolean hasControlCharacter(String value) {
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c < 0x20 || c == 0x7F) {
                return true;
            }
        }
        return false;
    }

    /** True when the value holds any control character or any whitespace (a URL must not). */
    static boolean hasControlOrWhitespace(String value) {
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c < 0x20 || c == 0x7F || Character.isWhitespace(c)) {
                return true;
            }
        }
        return false;
    }

    static boolean hasMarkupBracket(String value) {
        return value.indexOf('<') >= 0 || value.indexOf('>') >= 0;
    }
}
