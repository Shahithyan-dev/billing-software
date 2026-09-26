from PIL import Image

def remove_background(input_path, output_path):
    try:
        # Open the image
        img = Image.open(input_path)
        img = img.convert("RGBA")
        
        # Get the pixel data
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Check if pixel is white or nearly white
            # (R, G, B, A) - setting a threshold of 240
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                # Make the pixel transparent
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        # Update the image data
        img.putdata(newData)
        
        # Save the result
        img.save(output_path, "PNG")
        print("Successfully removed background!")
    except Exception as e:
        print(f"Error: {e}")

remove_background("d:\\Media Wave\\Billing software\\apps\\user-page\\public\\logo.png", "d:\\Media Wave\\Billing software\\apps\\user-page\\public\\logo.png")
