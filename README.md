# In-browser music visualizer

## Music visualizaton

Music visualization pertains to generation of dynamic, animated imagery based on the changes in characteristics of the sound being played. For the visualization to have desirable impact, the generation and rendering of visuals would ideally occur in real or close to real time giving the impression of being synchronized with the music. 

### Sound characteristics

Most common features of sound that can be utilized for its visualization are:
* [**amplitude**](http://www.indiana.edu/~emusic/acoustics/amplitude.htm) - determines the loudness of sound and allows to order it on a scale from quiet to loud
* [**frequency spectrum**](http://en.wikipedia.org/wiki/Audio_frequency) - represents a sound signal in the frequency domain (as opposed to time-domain), i.e. shows how much of the sound data lies within low, medium and high frequency bands

#### Links
* [Music visualization](http://en.wikipedia.org/wiki/Music_visualization)

## Implementation

### State of technology

Until only recently rich data visualizations (and sound visualizations in particular) in the browser domain could only be implemented with Adobe Flash platform and its ActionScript language (with Java applets being the other, but now extinct technology). With the advent of [HTML5](http://diveintohtml5.info/) and proliferation of [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) Web APIs followed by rapid adaptation of them by major browser vendors, sound processing and visualization can be achieved without any additional plugins on the user side.

Of this project’s particular interest on the sound processing side is the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) that provides audio analysis functionality to extract amplitude and frequency data from the sound.

As for the graphics generation side, two well supported technologies are available and will be taken advantage of: [Canvas](http://diveintohtml5.info/canvas.html) utilizing the immediate graphics mode and WebGL.

Additionally, [Video APIs](http://www.html5rocks.com/en/tutorials/video/basics/) will be used to load and possibly process external footage. 

### JavaScript libraries

To abstract low-level details of sound processing and graphics generation and focus on the goal of visualization itself, as well as normalize different browsers inconsistencies, JavaScript libraries are used in this project. 

* [jQuery](http://jquery.com/) – general purpose library simplifying client-side scripting of HTML and abstracting browser differences
* [p5.js](http://p5js.org/) – a JavaScript port of popular [Processing](https://processing.org/) visual design language which also includes an [audio library](http://p5js.org/reference/#/libraries/p5.sound) allowing for inclusion of audio input, playback, analysis and synthesis
* [Three.js](http://threejs.org/) – popular WebGL library

#### Other resources (to be sorted)
* [Making Audio Reactive Visuals](http://www.airtightinteractive.com/2013/10/making-audio-reactive-visuals/)
* [Sound Spectrum](http://newt.phys.unsw.edu.au/jw/sound.spectrum.html)
* [Spectral Analysis of Sound](http://clas.mq.edu.au/speech/acoustics/frequency/spectral.html)

