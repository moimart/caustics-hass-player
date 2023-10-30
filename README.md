caustics-hass-player
=====

# What the heck is this?

This is a simple website to be used together with a projector and to recreate the beatiful Blade Runner 2049 water caustics in Wallace's quarters

![Blade Runner 2049 Wallace's quarters' caustics](blade-runner-2049-caustics.png)

It's linked to a light you might have setup in home assistant to change the color of the caustics

# Setup

create a .env from the .env.sample

You will need to create a home assistant token and add it to the .env file. Select a fqn for a light in your home assistant to link the caustics color to and add it to the .env file. Finally add a full url for your home assistant instance

Once you have the .env file filled in, you can use docker-compose or build the docker image to get it up and running on port 3000

```
$ docker-compose up -d
```

Alternatively, if you just want to run it directly do:

```
$ npm install
```
then
```
$ node server.js
```

and point a browser to localhost:3000 to get the shader running. 

I have a raspberry pi running this connected to a projector

# Misc

There is commented code and a sample video in the html folder with recorded caustics instead of the default fragment shader. This is purely an exercise for the reader if you want to make it work; Just uncomment the code and change the fragment shader source variable. It should work right away. 

Be warned, some browser don't loop the video very smoothly.


