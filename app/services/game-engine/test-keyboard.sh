#!/bin/bash

# Test keyboard input on macOS ARM

echo "Testing keyboard input..."
echo "Press any key (will echo it back):"
echo "Press 'w' or 's' to test, 'q' to quit"
echo ""

# Save terminal settings
SAVED_STTY=$(stty -g)

# Configure terminal for raw input
stty -icanon -echo min 0 time 0

while true; do
    if read -t 0.1 -n 1 key 2>/dev/null; then
        if [ "$key" = "q" ] || [ "$key" = "Q" ]; then
            echo "Quit"
            break
        fi
        
        # Check for arrow keys
        if [ "$key" = $'\x1b' ]; then
            read -rsn1 -t 0.1 tmp
            if [ "$tmp" = "[" ]; then
                read -rsn1 -t 0.1 tmp
                case "$tmp" in
                    A)
                        echo "Arrow Up detected"
                        ;;
                    B)
                        echo "Arrow Down detected"
                        ;;
                esac
            fi
        else
            echo "Key pressed: '$key'"
        fi
    fi
done

# Restore terminal settings
stty $SAVED_STTY

