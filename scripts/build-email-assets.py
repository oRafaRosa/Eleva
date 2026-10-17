"""Rasteriza a assinatura tipográfica existente para clientes de e-mail sem webfonts."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
font = ImageFont.truetype(str(root / 'node_modules/@expo-google-fonts/allura/400Regular/Allura_400Regular.ttf'), 144)
box = font.getbbox('the club')
padding = 12
image = Image.new('RGBA', (box[2]-box[0]+2*padding, box[3]-box[1]+2*padding), (0,0,0,0))
ImageDraw.Draw(image).text((padding-box[0],padding-box[1]), 'the club', font=font, fill='#4B0B22')
image.save(root/'public/email/the-club.png', optimize=True)
print('Assinatura Allura:', image.size)
