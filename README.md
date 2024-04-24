# mkscreator
Use MKSheet in your images to create Animated texture files

# How to install
```
npm install -g @gonzalolog/mkscreator
```

# What's this useful for?
![bird_1](https://github.com/gonzalologorg/mkscreator/assets/7375225/3dae837d-8ec2-410f-b41e-c74d508a387f)

Convert an image like that in a valid format for Source Engine to be used on Particles since mksheet tool it's a bit ugly, [you can read more about mksheet in this link](https://developer.valvesoftware.com/wiki/Animated_Particles)

# Instruction on how to use it

Install this package globally, in first run it will ask you where is your source binaries folder (Make sure to modify or delete config.json)
After that just run in your terminal

mkscreator <file-path.png>

Adding single, will create single sequences to use sequence random operator

mkscreator <file-path.png> single

This one it's the default

mkscreator <file-path.png> loop

It will ask you the dimensions of your animation, in the example from above, it's gonna be 3x3, you can also specify if you want it to be an animation or a single frame so your particle can select randomly, and then drop a vtf with a vmt ready to be used on source

# How does it works

Well, it's boring and a bit forced, but basically the tool attacks a _vulnerability_ by how the system works:

- From the input, it will create Width x Height images (Not even split, just grabs frames)
- Convert those files to TGA
- Generates a sht file which the list of sequences on your final image
- Run mksheet from the tga files and sht into a single image
- Return a vtf along a vmt with the basic particle definition, only modify the final path on it

# Notes:

- Make the spritesheet png
- Doesn't work well with non power of two images
- Doesn't work well with 2x3 animations or 4x2, it must be the same number of rows and columns

The code it's pretty much awful to read, just a way I do tooling for myself
