from PIL import Image, ImageDraw

def create_icon(size, filename):
    # Create a new image with a white background
    image = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)
    
    # Calculate dimensions
    padding = size // 4
    shield_width = size - (2 * padding)
    shield_height = shield_width * 1.2
    
    # Draw a shield shape
    shield_color = (52, 152, 219)  # Blue
    
    # Shield coordinates
    x1, y1 = padding, padding
    x2, y2 = size - padding, size - padding
    
    # Draw shield
    draw.ellipse([x1, y1, x2, y2], fill=shield_color)
    
    # Draw checkmark
    if size >= 48:  # Only draw checkmark for larger icons
        check_color = (255, 255, 255)  # White
        check_width = size // 8
        
        # Checkmark coordinates
        center_x = size // 2
        center_y = size // 2
        
        # Draw checkmark
        points = [
            (center_x - check_width, center_y),
            (center_x, center_y + check_width),
            (center_x + check_width * 1.5, center_y - check_width)
        ]
        draw.line(points, fill=check_color, width=max(size // 16, 1))
    
    # Save the image
    image.save(filename, 'PNG')

# Create icons in different sizes
sizes = {
    16: 'chrome-extension/icons/icon16.png',
    48: 'chrome-extension/icons/icon48.png',
    128: 'chrome-extension/icons/icon128.png'
}

for size, filename in sizes.items():
    create_icon(size, filename)

# Create warning icon
def create_warning_icon(size, filename):
    image = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)
    
    # Warning triangle
    warning_color = (231, 76, 60)  # Red
    padding = size // 8
    
    # Triangle coordinates
    points = [
        (size//2, padding),  # Top
        (padding, size-padding),  # Bottom left
        (size-padding, size-padding)  # Bottom right
    ]
    
    # Draw triangle
    draw.polygon(points, fill=warning_color)
    
    # Draw exclamation mark
    if size >= 48:
        mark_color = (255, 255, 255)  # White
        center_x = size // 2
        
        # Exclamation mark dimensions
        mark_height = size // 3
        mark_width = size // 8
        mark_y = size // 2
        
        # Draw exclamation mark
        draw.rectangle([center_x - mark_width//2, mark_y - mark_height//2,
                       center_x + mark_width//2, mark_y + mark_height//4],
                      fill=mark_color)
        
        # Draw dot
        dot_size = mark_width
        draw.ellipse([center_x - dot_size//2, mark_y + mark_height//2,
                     center_x + dot_size//2, mark_y + mark_height//2 + dot_size],
                    fill=mark_color)
    
    image.save(filename, 'PNG')

# Create warning icons
warning_sizes = {
    16: 'chrome-extension/icons/warning16.png',
    48: 'chrome-extension/icons/warning48.png',
    128: 'chrome-extension/icons/warning128.png'
}

for size, filename in warning_sizes.items():
    create_warning_icon(size, filename)
