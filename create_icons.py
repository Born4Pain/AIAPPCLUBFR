from PIL import Image, ImageDraw, ImageFont
import os

# Create the 'images' directory if it doesn't exist
if not os.path.exists('images'):
    os.makedirs('images')

# Function to create a simple icon
def create_icon(size, filename):
    # Create a new image with a background color
    img = Image.new('RGBA', (size, size), color=(0, 122, 255, 255))  # Using the blue color from our app
    draw = ImageDraw.Draw(img)
    
    # Draw a simple shape - a rounded rectangle
    padding = size // 10
    draw.rounded_rectangle(
        [(padding, padding), (size - padding, size - padding)],
        fill=(52, 199, 89, 255),  # Green accent
        radius=size // 8
    )
    
    # Add text if the icon is large enough
    if size >= 192:
        try:
            # Try to load a system font
            font_size = size // 4
            font = ImageFont.truetype('Arial', font_size)
            
            # Draw text - modern Pillow version uses textbbox or textlength
            text = "AI"
            
            # For Pillow 9.0.0 and later
            try:
                left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
                text_width = right - left
                text_height = bottom - top
            except AttributeError:
                # Fallback for older Pillow versions
                try:
                    text_width, text_height = draw.textsize(text, font=font)
                except:
                    # Last resort fallback
                    text_width = font_size
                    text_height = font_size
            
            position = ((size - text_width) // 2, (size - text_height) // 2)
            draw.text(position, text, fill=(255, 255, 255, 255), font=font)
        except Exception as e:
            print(f"Could not add text to icon: {e}")
    
    # Save the image
    img.save(filename)
    print(f"Created icon: {filename}")

# Create a 16x16 favicon.ico
favicon = Image.new('RGBA', (16, 16), color=(0, 122, 255, 255))
draw = ImageDraw.Draw(favicon)
draw.rectangle([(4, 4), (12, 12)], fill=(52, 199, 89, 255))
favicon.save('favicon.ico')
print("Created favicon.ico")

# Create app icons in different sizes
create_icon(192, 'images/icon-192.png')
create_icon(512, 'images/icon-512.png')

print("All icons created successfully!") 