/*
 * main.js
 * 
 * @author Artur Paniczek
 */

/* global console, p5, THREE */

// main application object; if doesn't exist create a new one
var Visualizer = Visualizer || {};

/* namespacing function to support object hierarchies */
Visualizer.namespace = function(ns) {
	var parts = ns.split('.'),
		parent = Visualizer,
		i;

	// in case main object is included at the beginning
	if(parts[0] === 'Visualizer') {
		parts = parts.slice(1);
	}

	for(i = 0; i < parts.length; i += 1) {
		// if property doesn't exist create it
		if(typeof parent[parts[i]] === 'undefined') {
			parent[parts[i]] = {};
		}

		parent = parent[parts[i]];
	}

	return parent;
};

// create application hierarchy 
// initialization function
Visualizer.namespace('Visualizer.init'); 
// configuration object
Visualizer.namespace('Visualizer.config'); 
// general utilities
Visualizer.namespace('Visualizer.utils'); 
// classes for main application components
Visualizer.namespace('Visualizer.classes'); 
// classes for audio components (player and analyzer)
Visualizer.namespace('Visualizer.classes.audio'); 
// classes for video components (player and picker)
Visualizer.namespace('Visualizer.classes.video'); 
// classes for visualization components (manager, picker and customizer)
Visualizer.namespace('Visualizer.classes.fx'); 
// visualization functions
Visualizer.namespace('Visualizer.classes.fx.effects');
// references to key components of the visualizer
Visualizer.namespace('Visualizer.components');



/* container for key components */

Visualizer.components = {
	$visualizer: null, // <div> element holding the application
	messenger: null, 
	audioPlayer: null,
	videoPicker: null,	
	videoPlayer: null,
	fxManager: null
};


/* configuration object */

Visualizer.config = {

	visualizerId: 'visualizer', // holding <div> element's ID

	audioPlayer: {
		isOpened: false, // initial state of the player
		wrapperId: 'audio-player', // audio player container
		playerId: 'player', // <audio> tag container
		toggleTime: 250, // panel toggle time
		// jPlayer configuration object
		jPlayerConf: {
			// fired on jPlayer ready to be used
			ready: function () {
				// set MP3 to load
				$(this).jPlayer('setMedia', {
					mp3: 'mp3/big-bud_high-times.mp3'
				});
			},
			// overwrites for selector names
			cssSelectorAncestor: '#player-container',
			cssSelector: {
				title: '',
				gui: '#player-gui',
				play: '#player-play',
				pause: '#player-pause',
				mute: '#player-mute',
				seekBar: '#player-seek-bar',
				playBar: '#player-play-bar',
				currentTime: '#player-current-time',
				volumeBar: '#player-volume-bar',
				volumeBarValue: '#player-volume-bar-value',
			},
		// supported formats
		supplied: 'mp3'
		}

	},

	audioDataAnalyser: {
		// constant that averages data analysed in the last frame
		smoothingTimeConstant: 0.2,
		// how many samples (bins) will be available for analysis by default
		bufferSize: 1024 
	},

	videoPlayer: {
		wrapperId: 'video-container',
		videoPath: 'video'
	},

	videoPicker: {
		wrapperId: 'video-picker',
		videoPath: 'video',
		isOpened: false,
		startupVideoIdx: -1, // index of a video to be shown at startup; set to -1 for no video
		videos: ['clouds', 'african-night', 'winter-landscape-1']
	},

	fxPicker: {
		wrapperId: 'fx-picker',
		isOpened: false,
		fxImagePath: 'img/fx-covers', // image representations visualizations in the picker
		startupFx: 'bars' // visualization to load at startup
	},

	fxCustomizer: {
		wrapperId: 'fx-customizer',
		isOpened: false
	},

	// settings for visualizations
	fx: {
		wrapperId: 'fx-container', // <canvas> holder
		
		effects: {
			// circles visualization 
			'circles': {
				settings: {
					// number of circles on screen
					noOfCircles: {
						label: 'Amount',
						// whether this setting will actually appear on the panel
						userConfigurable: true,
						// type of the setting (corresponds <input type='range'> element)
						type: 'range',
						// default value
						value: 50, 
						range: {
							min: 1,
							max: 500
						}
					},
					// maximum diameter a circle can have
					maxDiameter: {
						label: 'Max. diameter',
						userConfigurable: true,
						type: 'range',
						value: 80,
						range: {
							min: 20,
							max: 200
						}
					},
					// maximum relative velocity a circle can travel
					maxVelocity: {
						label: 'Max. velocity',
						userConfigurable: true,
						type: 'range',
						value: 2,
						range: {
							min: 0,
							max: 10
						}
					},
					// amount of blur for this visualization
					blur: {
						label: 'Blur',
						userConfigurable: true,
						type: 'range',
						value: 0,
						range: {
							min: 0,
							max: 50
						}
					},
					// base colours for low, medium and high frequencies
					lowFreqColor: {
						label: 'Low freq. colour',
						userConfigurable: true,
						// will result in <input type='color'> element
						type: 'color',
						// initial value
						value: '#CC6600'
					},
					midFreqColor: {
						label: 'Mid freq. colour',
						userConfigurable: true,
						type: 'color',
						value: '#006699'
					},
					hiFreqColor: {
						label: 'Hi freq. colour',
						userConfigurable: true,
						type: 'color',
						value: '#669900'
					}
				}
			},
			// 3D bars visualization configuration
			'bars': {
				settings: {
					// relative cube size
					size: {
						label: 'Cube size',
						userConfigurable: false,
						value: 2
					},
					// bar pad size 
					noOfBands: {
						label: 'Amount',
						userConfigurable: true,
						type: 'dropdown', // will generate <select> element
						value: 256,
						values: [16, 64, 256, 1024] // dropdown list items (<option> elements)
					},
					// whether to show wireframe only
					isWireframe: {
						label: 'Wireframe only?',
						userConfigurable: true,
						type: 'checkbox',
						value: false
					},
					// bar strength amplifier
					amplifier: {
						label: 'Amplify',
						userConfigurable: true,
						type: 'range',
						value: 3,
						range: {
							min: 1,
							max: 5
						}
					},
					opacity: {
						label: 'Opacity',
						userConfigurable: true,
						type: 'range',
						value: 0.8,
						range: {
							min: 0.1,
							max: 1
						},
						step: 0.1
					},
					// how close to the camera
					scale: {
						label: 'Proximity',
						userConfigurable: true,
						type: 'range',
						value: 0.7,
						range: {
							min: 0.1,
							max: 2
						},
						step: 0.01
					},
					autorotationSpeed: {
						label: 'Autorotation',
						userConfigurable: true,
						type: 'range',
						value: 0.1,
						range: {
							min: 0,
							max: 10
						},
						step: 0.1
					},
					xRotation: {
						label: '(X) Rotation',
						userConfigurable: true,
						type: 'range',
						value: 0,
						range: {
							min: 0,
							max: 360
						},
						step: 0.01
					},
					yRotation: {
						label: '(Y) Rotation',
						userConfigurable: true,
						type: 'range',
						value: 0,
						range: {
							min: 0,
							max: 360
						},
						step: 0.01
					},
					zRotation: {
						label: '(Z) Rotation',
						userConfigurable: true,
						type: 'range',
						value: 0,
						range: {
							min: 0,
							max: 360
						},
						step: 0.01
					},
					lowFreqColor: {
						label: 'Low freq. colour',
						userConfigurable: true,
						type: 'color',
						value: '#CC6600'
					},
					midFreqColor: {
						label: 'Mid freq. colour',
						userConfigurable: true,
						type: 'color',
						value: '#006699'
					},
					hiFreqColor: {
						label: 'Hi freq. colour',
						userConfigurable: true,
						type: 'color',
						value: '#669900'
					}
				}
			},
			'waves': {
				settings: {
					noOfWaves: {
						label: 'Number of waves',
						userConfigurable: true,
						value: 200,
						type: 'range',
						range: {
							min: 10,
							max: 1000
						}
					},
					waveWidth: {
						label: 'Wave width',
						userConfigurable: true,
						value: 200,
						type: 'range',
						range: {
							min: 10,
							max: 500
						}
					},					
					pointsPerWave: {
						label: 'Points per wave',
						userConfigurable: true,
						type: 'range',
						value: 800,
						range: {
							min: 100,
							max: 3000
						}
					},
					amplifier: {
						label: 'Amplify',
						userConfigurable: true,
						type: 'range',
						value: 2,
						range: {
							min: 1,
							max: 10
						}
					},
					// how frequently should the waves be generated
					generationInterval: {
						label: 'Generation interval',
						userConfigurable: true,
						type: 'range',
						value: 2,
						range: {
							min: 1,
							max: 5
						}
					},
					// relative distance between consecutive waves
					waveSpacing: {
						label: 'Wave spacing',
						userConfigurable: true,
						type: 'range',
						value: 10, 
						range: {
							min: 1,
							max: 30
						}
					},
					// relative amount of how the whole scene is skewed
					skew: {
						label: 'Skew',
						userConfigurable: true,
						type: 'range',
						value: 0,
						range: {
							min: -1,
							max: 1
						},
						step: 0.1
					},
					horizontalPan: {
						label: 'Camera horizontal',
						userConfigurable: true,
						type: 'range',
						value: 0.02,
						range: {
							min: -1,
							max: 1
						},
						step: 0.01
					},
					verticalPan: {
						label: 'Camera vertical',
						userConfigurable: true,
						type: 'range',
						value: 0.1,
						range: {
							min: -1,
							max: 1
						},
						step: 0.01
					},
					proximity: {
						label: 'Camera front-to-back',
						userConfigurable: true,
						type: 'range',
						value: 0.2,
						range: {
							min: -1,
							max: 1
						},
						step: 0.01
					},
					opacity: {
						label: 'Opacity',
						userConfigurable: true,
						type: 'range',
						value: 0.7,
						range: {
							min: 0.1,
							max: 1
						},
						step: 0.1
					},
					maxVolumeColor: {
						label: 'Max. volume color',
						userConfigurable: true,
						type: 'color',
						value: '#bf0f3b'
					},
					minVolumeColor: {
						label: 'Min. volume color',
						userConfigurable: true,
						type: 'color',
						value: '#777777'
					}

				}
			}
		}
	}
};



/* class for displaying system messages */

Visualizer.classes.Messenger = (function() {
	/* private and helper variables */
	var // information page (will span the whole viewport)
		$wrapper,	
		// info page elements
		$closeButton, $forwardButton, $messageHeader, $messageBody,
		// constructor function
		Constr;

	/* constructor */
	Constr = function() {
		// initialize page and its elements
		$wrapper = $('#messenger');
		$closeButton = $('.messenger-close span', $wrapper);
		$forwardButton = $('.messenger-forward span', $wrapper);
		$messageHeader = $('.messenger-message-header', $wrapper);
		$messageBody = $('.messenger-message-body', $wrapper);
	};

	/* public methods */
	Constr.prototype = {

		/* displays application overview in several pages */
		playTour: function() {
			var // page we're currently on
				currentPage = 0,  
				// array with all the pages in the tour
				pages = [
				{
					// page's message header
					header: 'In-browser Music Visualizer',
					// message contents
					body: 'This application utilizes the latest web technologies to explore different ways of visualizing sound. It takes time and frequency domain data from the audio source and uses HTML Canvas and Web GL APIs to visualize it.<br><br>This application is optimized for Google Chrome browser.',
					// clean-up of the previous page
					preCallback: null,
					// code to run on this page
					postCallback: null
				},
				{
					header: 'Choosing audio source',
					body: 'You can play predefined track or you can drag and drop an MP3 track from your desktop to anywhere on this page. Additionally you can allow the sound to be streamed from your microphone.',
					preCallback: null,
					postCallback: function() {
						// bring audio player to the front and fade it in
						Visualizer.components.audioPlayer.$wrapper.css('zIndex', 100);
						Visualizer.components.audioPlayer.open(true);
					}
				},
				{
					header: 'Visualization',
					body: 'Use this panel to choose from available visualizations',
					preCallback: function() {
						// hide audio player before displaying this message
						Visualizer.components.audioPlayer.close(false);
						Visualizer.components.audioPlayer.$wrapper.css('zIndex', 0);
					},
					postCallback: function() {					
						Visualizer.components.fxPicker.$wrapper.css('zIndex', 100);
						Visualizer.components.fxPicker.open(true);
					}
				},
				{
					header: 'Customization',
					body: 'This panel lets you adjust parameters of the active visualization',
					preCallback: function() {
						Visualizer.components.fxPicker.close(false);
						Visualizer.components.fxPicker.$wrapper.css('zIndex', 0);
					},
					postCallback: function() {
						Visualizer.components.fxManager.customizer.$wrapper.css('zIndex', 100);
						Visualizer.components.fxManager.customizer.open(true);
					}
				},
				{
					header: 'Background video',
					body: 'You can also choose from available videos that will replace the background',
					preCallback: function() {
						Visualizer.components.fxManager.customizer.close(false);
						Visualizer.components.fxManager.customizer.$wrapper.css('zIndex', 0);
					},
					postCallback: function() {
						Visualizer.components.videoPicker.$wrapper.css('zIndex', 100);
						Visualizer.components.videoPicker.open(true);
					}
				}
			];

			// set initial content to the first page
			$messageHeader.html(pages[0].header);
			$messageBody.html(pages[0].body);

			// attach handler for the close button
			$closeButton.on('click', function() {
				// fade out the page and its elements
				$messageHeader.fadeTo('slow', 0, function() {
						$(this).empty();
						// show audio player and hide video player after closing
						Visualizer.components.audioPlayer.open(true);
						Visualizer.components.videoPicker.close(true);
					});
				$messageBody.fadeTo('slow', 0, function() {
						$(this).empty();
					});
				$forwardButton.fadeTo('slow', 0);
				$wrapper.fadeOut();
			});

			// make sure glyph icon is right chevron (as it could've been overwritten by an earlier error message)
			$forwardButton.attr('class', 'glyphicon glyphicon-chevron-right');

			// attach handler to the forward button - display next page's info upon every click
			$forwardButton.on('click', function() {

				currentPage++;

				// check if there's next page available
				if(currentPage < pages.length) {

					// fade out the previous header, call clean-up code and fade in this page's header
					$messageHeader.fadeTo('slow', 0, function() {
						if(pages[currentPage].preCallback !== null) {
							pages[currentPage].preCallback();
						}
						$(this).html(pages[currentPage].header);
						$(this).fadeTo('slow', 1, function() {
							if(pages[currentPage].postCallback !== null) {
								pages[currentPage].postCallback();
							}
						});
					});

					// fade out the previous page's content, put new one, then fade it in
					$messageBody.fadeTo('slow', 0, function() {
						$(this).html(pages[currentPage].body);
						$(this).fadeTo('slow', 1);
					});					
				} else { // no more pages , close the page
					$closeButton.click();
				}
			});
		},

		/* shows page with a warning or error message */
		errorMessage: function(message, noDefaultMessage) {


			// recycle forward button as a warning icon; fade in the page and its elements
			$forwardButton.attr('class', 'glyphicon glyphicon-warning-sign').fadeTo('fast', 1);

			// set warning's header
			$messageHeader.html('There\'s been a problem').fadeTo('fast', 1);

			// add error message passed
			$messageBody.html(
				message + 
				
				// see whether the default message is requested to be added 
				(noDefaultMessage === true ? ' ' : ' Please upgrade to latest Chrome or Firefox.')
			).fadeTo('fast', 1);
			$wrapper.fadeIn();
		}
	};

	return Constr;
}());



/* video player class handling <video> element */

Visualizer.classes.video.VideoPlayer = (function() {
	var // make shortcut to the configuration object for video player
		config = Visualizer.config.videoPlayer,
		Constr;

	Constr = function() {
		this.$wrapper = $('#' + config.wrapperId);

		// in case video has sound, mute it; can't be done via attribute, only property
		this.$wrapper.prop('muted', true);
	};

	Constr.prototype = {

		/* loads a video with a given ID (same as the video file name) */
		load: function(videoId) {

			// set the poster to be shown while the video is being fetched
			this.$wrapper.attr('poster', config.videoPath + '/' + videoId + '.png');

			// MP4 and WebM versions of the file cover all modern browsers
			$('[type="video/webm"]', this.$wrapper).attr('src', config.videoPath + '/' + videoId + '.webm');
			$('[type="video/mp4"]', this.$wrapper).attr('src', config.videoPath + '/' + videoId + '.mp4');

			// immediately load and play the video
			this.$wrapper[0].load();
			this.$wrapper[0].play();
		}
	};

	return Constr;
}());



/* class displaying available videos and letting the user pick one */

Visualizer.classes.video.VideoPicker = (function() {

	/* private and helper variables and functions */
	var config = Visualizer.config.videoPicker,
		classes = Visualizer.classes,

		// picker wrapper
		$wrapper = $('#'+config.wrapperId),

		// main picker body
		$pickerContainer = $('.picker-container', $wrapper),

		// picker handle letting the user slide it in or out
		$handle = $('.handle', $wrapper),

		// initial state of the picker panel  
		isOpened = config.isOpened,

		/* opens or closes the panel; confObj has 'action' (close or open) and 'animate' (true or false) settings */
		toggle = function(confObj) {
			
			var // whether the panel needs to be closed
				shouldClose = confObj.action == 'close'; 

			// animate opening or closing action
			$wrapper.animate({
					// if should close slide it up by the distance equal to the panel height; else place it back on the viewport's edge
					top: shouldClose ? -$pickerContainer.outerHeight() : 0
				}, 
				// set duration; if it shouldn't animate (i.e. needs to be closed immediately) set duration to 0
				confObj.animate ? config.toggleTime : 0, 
				// set easing
				'linear', 
				// after the animation update the handle arrows
				function() {
					if(shouldClose) {
						$('.open-arrow', $handle).show();
						$('.close-arrow', $handle).hide();
					} else {
						$('.open-arrow', $handle).hide();
						$('.close-arrow', $handle).show();
					}			

				}
			);
		},

		Constr
		;

	Constr = function() {
		var // reference to this will be lost while setting the handler so it needs to be remembered
			that = this;

		// object to keep available videos 
		this.videos = {};
		this.$wrapper = $wrapper;
		
		// will let user disable videos
		this.$noChoice = $('.no-choice', $wrapper);
		// populate with videos
		for(var i = 0; i < config.videos.length; i++) {
			this.videos[config.videos[i]] = new classes.video.VideoPicker.VideoPick(config.videos[i]);
		}

		// make handle functional 
		$handle.on('click', function() {
			if(that.isOpened) {
				that.close(true);
			} else {
				that.open(true);
			}
		});

		// open or close depending on inital setting
		if(isOpened) {
			this.open(false);
		} else {
			this.close(false);
		}

		// if any of the videos is requested in configuration object, load it via VideoPick's select() method
		if(config.startupVideoIdx > -1) {
			this.videos[config.videos[config.startupVideoIdx]].select();
		} else {
			Visualizer.components.$visualizer.addClass('no-video');
		}

		// 'no videos' thumbnail
		this.$noChoice.on('click', function() {
			that.$noChoice.siblings().removeClass('active-video');
			Visualizer.components.$visualizer.addClass('no-video');
		});
	};

	Constr.prototype = {
		/* slides the player up */
		close: function(animate) {
			this.isOpened = false;
			toggle({action: 'close', animate: animate});

				
		}, 
		/* slide the player down */
		open: function(animate) {
			if(!this.isOpened){ 
				this.isOpened = true;
				toggle({action: 'open', animate: animate});
			}
			
		}  
	};

	return Constr;

}());



/* class representing an individual video pick (thumbnail) on the picker panel */

Visualizer.classes.video.VideoPicker.VideoPick = (function() {
	var config = Visualizer.config.videoPicker,
		Constr;

	Constr = function(videoPickId) {
		var that = this;
		this.id = videoPickId;

		// create <div> element for this pick, add thumbnail and click handler
		this.$wrapper = $('<div/>')
							.addClass('video-image')
							.css('background-image', 'url('+config.videoPath + '/' + videoPickId + '.png)')
							.on('click', function() {
								that.select();
							});

		// append the picker <div> to the picker panel container
		$('#' + config.wrapperId + ' .picker-container').append(this.$wrapper);
	};

	Constr.prototype = {
		/* loads a video represented by this pick */
		select: function() {
			// no longer no videos chosen
			Visualizer.components.$visualizer.removeClass('no-video');
			// set as active
			this.$wrapper.addClass('active-video');
			// set the rest as not active anymore
			this.$wrapper.siblings().removeClass('active-video');
			// tell the player to load the video
			Visualizer.components.videoPlayer.load(this.id);
		}
	};

	return Constr;
}());



/* class for managing available visualizations */

Visualizer.classes.fx.FXManager = (function() {
	var config = Visualizer.config.fx,
		classes= Visualizer.classes,
		Constr;

	Constr = function() {
		// current visualization ID
		this.fxId = null;
		// p5.js object for current visualization
		this.p5obj = null;
		// customizer panel for current visualization
		this.customizer = new classes.fx.FXCustomizer();
	};

	Constr.prototype = {

		/* loads visualization with a given ID */
		load: function(fxId) {
			this.fxId = fxId;
			
			// in case there is already a visualization in place remove it
			if(this.p5obj !== null) {
				// perform clean up operations prior to p5.js object removal
				this.p5obj.cleanup();
				// remove p5.js object
				this.p5obj.remove();
			}
			
			// pass visualization function and ID of the visualization container and the ID of the visualizations' container
			this.p5obj = new p5(classes.fx.effects[fxId], config.wrapperId);

			// populate customizer panel with settings for the current visualization
			this.customizer.loadSettings(fxId);
		}
	};

	return Constr;

}());



/* class for visualizations picker panel */

Visualizer.classes.fx.FXPicker = (function() {
	var /* private and helper variables and methods */
		config = Visualizer.config.fxPicker,
		classes = Visualizer.classes,

		// grab components
		$wrapper = $('#'+config.wrapperId),
		$pickerContainer = $('.picker-container', $wrapper),
		$handle = $('.handle', $wrapper), 
		isOpened = config.isOpened,
		
		/* slides the panel in or out, depending on the confObj.acton set */
		toggle = function(confObj) {
			var shouldClose = confObj.action == 'close';

			$wrapper.animate({
					right: shouldClose ? -$pickerContainer.outerWidth() : 0
				}, confObj.animate ? config.toggleTime : 0, 'linear', function() {
					if(shouldClose) {
						$('.open-arrow', $handle).show();
						$('.close-arrow', $handle).hide();
					} else {
						$('.open-arrow', $handle).hide();
						$('.close-arrow', $handle).show();
					}			

				}
			);
		},

		Constr 
		;


	Constr = function() {
		var that = this;

		// object to keep available visualizations 
		this.fxs = {};
		this.$wrapper = $wrapper;
		this.$noChoice = $('.no-choice', $wrapper);
		
		// populate with visualizations specified in configuration object
		for(var fx in Visualizer.config.fx.effects) {
			this.fxs[fx] = new classes.fx.FXPicker.FXPick(fx);
		}

		$handle.on('click', function() {
			if(that.isOpened) {
				that.close(true);
			} else {
				that.open(true);
			}
		});

		if(isOpened) {
			this.open(false);
		} else {
			this.close(false);
		}
		
		// if there's a startup visualizaiton specified in the configuration, run it via FXPick.select()
		if(config.startupFx !== null) {
			this.fxs[config.startupFx].select();
		} else {
			// otherwise set panel state to no visualizations
			Visualizer.components.$visualizer.addClass('no-fx');
		}

		this.$noChoice.on('click', function() {
			that.$noChoice.siblings().removeClass('active-fx');
			Visualizer.components.$visualizer.addClass('no-fx');
		});
	};

	Constr.prototype = {
		/* slides the picker to the right and off-screen */
		close: function(animate) {
			this.isOpened = false;
			toggle({action: 'close', animate: animate});				
		}, 
		/* slide the picker back on the screen */
		open: function(animate) {
			if(!this.isOpened){ 
				this.isOpened = true;
				toggle({action: 'open', animate: animate});
			}			
		}  
	};

	return Constr;
}());



/* class representing a visualization option on the picker panel */

Visualizer.classes.fx.FXPicker.FXPick = (function() {
	var config = Visualizer.config.fxPicker,
		Constr;

	Constr = function(fxPickId) {
		var that = this;
		this.id = fxPickId;
		// create element for this pick and add visualization thumbnail and behaviour
		this.$wrapper = $('<div/>')
							.addClass('fx-image')
							.css('background-image', 'url('+config.fxImagePath + '/' + fxPickId + '.png)')
							.on('click', function() {
								that.select();
							});

		// add this pick to the picker panel
		$('#' + config.wrapperId + ' .picker-container').append(this.$wrapper);
	};

	Constr.prototype = {
		/* loads the visualization this pick represents */
		select: function() {

			// no more no visualizations chosen
			Visualizer.components.$visualizer.removeClass('no-fx');

			// mark this pick as active
			this.$wrapper.addClass('active-fx');

			// mark other picks as not active anymore
			this.$wrapper.siblings().removeClass('active-fx');

			// delegate it to the manager
			Visualizer.components.fxManager.load(this.id);
		}
	};

	return Constr;
}());



/* class representing visualizations customizer panel */

Visualizer.classes.fx.FXCustomizer = (function() {
	var config = Visualizer.config.fxCustomizer,

		// initialize the main components
		$wrapper = $('#'+config.wrapperId),
		$pickerContainer = $('.picker-container', $wrapper),
		$handle = $('.handle', $wrapper), 

		isOpened = config.isOpened,
		
		/* slides the panel right (if closing) or left (if opening) */
		toggle = function(confObj) {
			var shouldClose = confObj.action == 'close';

			$wrapper.animate({
					right: shouldClose ? -$pickerContainer.outerWidth() : 0
				}, confObj.animate ? config.toggleTime : 0, 'linear', function() {
					if(shouldClose) {
						$('.open-arrow', $handle).show();
						$('.close-arrow', $handle).hide();
					} else {
						$('.open-arrow', $handle).hide();
						$('.close-arrow', $handle).show();
					}
				}
			);
		},

		Constr 
		;


	Constr = function() {
		var that = this;

		// object to keep settings for the current visualization 
		this.options = {};
		
		this.$wrapper = $wrapper;

		$handle.on('click', function() {
			if(that.isOpened) {
				that.close(true);
			} else {
				that.open(true);
			}
		});
	};

	Constr.prototype = {
		
		/* slides the picker to the right */
		close: function(animate) {
			this.isOpened = false;
			toggle({action: 'close', animate: animate});		
		}, 

		/* slides the picker to the left */
		open: function(animate) {
			if(!this.isOpened){ 
				this.isOpened = true;
				toggle({action: 'open', animate: animate});
			}
			
		},

		/* loads settings for  visualization ID given */
		loadSettings: function(fxId) {
			var 
				// container for a setting
				$settingDiv,
				// <select> container
				$dropdown, 
				// left column of the panel
				$leftSection = $('<div>', {class: 'left-section'}),
				// right column of the panel
				$rightSection = $('<div>', {class: 'right-section'}),
				// ID for the <input> element
				inputId,
				// <input> element type
				inputType,
				// setting property name
				setting,
				// object to represent a setting
				settingObj,
				// configuration object for this effect
				settings = Visualizer.config.fx.effects[fxId].settings,
				// number of configurable settings (i.e. those with userConfigurable property set to true)
				configurableSettingsNo,
				// counter for the settings
				i = 0;

			// see how many settings are configurable
			configurableSettingsNo = $.grep(Object.keys(settings), function(key) {
				return settings[key].userConfigurable === true;
			}).length;

			// clear container of previous settings
			$pickerContainer.empty();
			
			// go through settings in configuration object and generate HTML element for each
			for(setting in settings) {				

				settingObj = settings[setting];

				// skip non-user-configurable settings
				if(!settingObj.userConfigurable) {
					continue;
				}

				i++; 

				// make a unique ID for this element
				inputId = fxId + '-' + setting;

				// see what element type we need
				inputType = settings[setting].type;

				// creating a <div> for this setting and add a label
				$settingDiv = 
					$('<div>', {class: 'fx-option type-' + inputType})
						.append($('<label>', {for: inputId}).text(settingObj.label));

				// depending on <input> type create appropriate markup
				switch(settingObj.type) {

					// <input type='range'> element
					case 'range':
						$settingDiv

							// create and append range limits labels for this element 
							.append(
								$('<div>', {class: 'range-labels'})
									.append(
										$('<span>', {class: 'left-label'}).text(settingObj.range.min)
									)
									.append(
										$('<span>', {class: 'right-label'}).text(settingObj.range.max)
									)
							)

							// create and append the element itself
							.append(
								$('<input>', 

									// pass in object with attributes for this element
									{
										type: 'range', 
										id: inputId, 
										min: settingObj.range.min, 
										max: settingObj.range.max, 
										value: settingObj.value, 
										step: settingObj.step !== undefined ? settingObj.step : 1
									})

									// make a reference to the current setting object
									.data({settingObj: settingObj, settingId: setting})

									// set handler to be fired when user interacts with this element
									.on('input', function(e, value) { // current value passed to the handler
										if(value !== undefined) {

											// rotate the value; needed for range inputs that are animated and go from maximum to minimum values
											if(value >= $(this).data('settingObj').range.max) {
												value = $(this).data('settingObj').range.min;
											}

											// finally set the value for this range element
											$(this).val(value);
										}

										// update the value for this setting in configuration object
										$(this).data('settingObj').value = $(this).val();

										// if visualization needs refreshing after the range change, run it
										if(Visualizer.components.fxManager.p5obj.refresh !== undefined) {
											Visualizer.components.fxManager.p5obj.refresh($(this).data('settingId'));
										}
									})
							);

						break;

					// <input type='color'> element
					case 'color':
						$settingDiv
							// create and append <input> color element
							.append(
								$('<input>', {type: 'color', id: inputId})
									.prop('value', settingObj.value)
									.data({settingObj: settingObj, settingId: setting})
									.on('input', function() {

										// update the colour value in the configuration
										$(this).data('settingObj').value = $(this).val();
										// call refreshing function if specified
										if(Visualizer.components.fxManager.p5obj.refresh !== undefined) {
											Visualizer.components.fxManager.p5obj.refresh($(this).data('settingId'));
										}
									})
							);

						break;

					// <input type='checkbox'> element
					case 'checkbox':
						$settingDiv
							// create and append the element
							.append(
								$('<input>', {type: 'checkbox', id: inputId})
									.prop('checked', false)
									.data({settingObj: settingObj, settingId: setting})
									.on('click', function() {
										$(this).data('settingObj').value = $(this).is(':checked');
										if(Visualizer.components.fxManager.p5obj.refresh !== undefined) {
											Visualizer.components.fxManager.p5obj.refresh($(this).data('settingId'));
										}
									})
							);

						break;

					// <select> element
					case 'dropdown':

						// create the element
						$dropdown = $('<select>', {id: inputId});

						// attach the list items (<option>s) based on the configuration
						for(var key in settingObj.values) {
							$dropdown.append(
								$('<option>', {value: settingObj.values[key]}).text(settingObj.values[key])
								
							);
						}

						// set the selected value for this dropdown and attach on interaction handler
						$dropdown
							.val(settingObj.value)
							.data({settingObj: settingObj, settingId: setting})
							.on('change', function() {
								$(this).data('settingObj').value = $(this).val();
								if(Visualizer.components.fxManager.p5obj.refresh !== undefined) {
									Visualizer.components.fxManager.p5obj.refresh($(this).data('settingId'));
								}
							});

						$settingDiv.append($dropdown);

						break;
				}

				// assign current setting's <div> to either left or right panel column
				if(i <= configurableSettingsNo/2) {
					$leftSection.append($settingDiv);
				} else {
					$rightSection.append($settingDiv);
				}

				$pickerContainer.prepend([$leftSection, $rightSection]);

			}

			// customizer panel is created so its width is known and we're able to open or close it (as these operations need to know the width)
			if(isOpened) {
				this.open(false);
			} else {
				this.close(false);
			}

			// if customizer panel is not fitting into upper half of the viewport make room by moving both this panel and Visualizations picker  down
			if($wrapper.height() > $(window).height()/2) {
				Visualizer.components.fxPicker.$wrapper.css({bottom: 0, top: 'auto'});	
				$wrapper.css({bottom: Visualizer.components.fxPicker.$wrapper.height(), top: 'auto'});
			} 
		} 
	};

	return Constr;
}());



/* object containing visualization functions */

Visualizer.classes.fx.effects = {


	/* circles visualization */
	'circles': function(p) { // p5.js object passed

		var // state variable points to the configuration object for this visualization
			state = Visualizer.config.fx.effects['circles'],
			config = state.settings,

			// will hold all the circles in the visualization
			circles = [],
			// will hold generated colours for each band
			colors = [],
			// Circle class
			Circle, 
			// fetch analyser node
			audioDataAnalyser = Visualizer.components.audioDataAnalyser,
			// how many samples will be available 
			bufferSize = audioDataAnalyser.analyser.fftSize/2,

			// shortcut to hex-to-RGB converter
			rgb = Visualizer.utils.convertToRgb,

			/* fills colors array with colours generated from low, medium and high frequencies colours from the configuration */ 
			generateColors = function() {
				var i, 
					// RGB converted from hex
					rgbColor, 
					// temporary from and to colours for lerp colour generator
					fromColor, 
					toColor,
					// set mid frequency stop at half of the spectrum
					midFreqLimit = p.floor(0.5*bufferSize);

				colors = [];
				
				// generate first half of the spectrum
				rgbColor = rgb(config.lowFreqColor.value);
				fromColor = p.color(rgbColor.r, rgbColor.g, rgbColor.b);
				rgbColor = rgb(config.midFreqColor.value);
				toColor = p.color(rgbColor.r, rgbColor.g, rgbColor.b);

				for(i = 0; i < midFreqLimit; i++) {				
					colors.push(p.lerpColor(fromColor, toColor, 1/midFreqLimit*i));
				}

				// generate second half of the spectrum
				fromColor = toColor;
				rgbColor =rgb(config.hiFreqColor.value);
				toColor = p.color(rgbColor.r, rgbColor.g, rgbColor.b);

				for(i = midFreqLimit; i < bufferSize; i++) {
					colors.push(p.lerpColor(fromColor, toColor, 1/(bufferSize-midFreqLimit)*(i-midFreqLimit)));
				}

			}
			;


		/* class representing a circle in this visualization */
		Circle = (function() {
			var Constr;

			/* constructor function; takes x and y coordinates */
			Constr = function(x, y) {

				// band in the frequency spectrum this circle will visualize
				this.band = p.floor(p.random(bufferSize));
				this.color = colors[this.band];
				
				// initial magnitude (strength) of the band for this circle
				this.magnitude =  0.1;
				
				// x coordinate
				this.x = x;
				
				// y coordinate
				this.y = y;

				// current diameter
				this.diameter = 0;
				
				// current opacity
				this.opacity = 0;
				
				// the velocity the circle moves with
				this.velocity = p.random(config.maxVelocity.range.min, config.maxVelocity.value);
				
				// deviation off course
				this.direction = 0;
				
				// amount of deviation
				this.deviation = p.random(-0.007, 0.007);  
				
				// maximum diameter the circle can reach
				this.nominalDiameter = p.floor(p.random(config.maxDiameter.range.min, config.maxDiameter.value));
				
				// maximum opacity the circle can reach
				this.nominalOpacity = p.random(0.4, 1);
				
				// next diameter value in the drawing loop
				this.targetDiameter = 0;
				
				// next opacity value in the drawing loop
				this.targetOpacity = 0;    
				
				// overlay circle offset 
				this.offset = {
					x: p.random() > 0.5 ? 5 : -5,
					y: p.random() > 0.5 ? 5 : -5
				};

			};

			/* public methods of Circle class */
			Constr.prototype = {

				/* recalculates given parameter for this cirlce as requested from the customizer panel via the p5.js refresh function */
				refresh: function(settingId) {

					switch(settingId) {

						// recalculate diameter or velocity with the new maxima given
						case 'maxDiameter':
							this.nominalDiameter = p.floor(p.random(config.maxDiameter.range.min, config.maxDiameter.value));
							break;

						case 'maxVelocity':
							this.velocity = p.random(config.maxVelocity.range.min, config.maxVelocity.value);
							break;

						// colours have been regenerated, assign new colour
						case 'lowFreqColor':
						case 'midFreqColor':
						case 'hiFreqColor':
							this.color = colors[this.band];
							break;
					}
				},

				/* redraws the circle for the current frame */ 
				redraw: function() {

					// update movement
					this.y += this.velocity;

					// update direction by deviation
					this.direction += this.deviation;

					// calculate values of diameter and opacity in the next step
					this.targetDiameter = p.max(this.targetDiameter, this.nominalDiameter * p.exp(this.magnitude)) ;
					this.targetOpacity = p.max(this.targetOpacity, this.nominalOpacity * this.magnitude);

					// update the diameter and opacity values; make transition more seamless by decreasing delta
					this.diameter += 0.4 * (this.targetDiameter - this.diameter);
					this.opacity += 0.4 * (this.targetOpacity - this.opacity);

					// set stroke and fill colours
					p.stroke(0, 0, 0, 128);					
					p.fill(p.red(this.color), p.green(this.color), p.blue(this.color), this.opacity*255);
					
					// draw main circle circle
					p.ellipse(this.x + p.cos(this.velocity * this.direction)*100, this.y, this.diameter, this.diameter);

					// set settings for the overlay circle and draw it
					p.noStroke();
					p.fill(p.red(this.color), p.green(this.color), p.blue(this.color), 20);
					p.ellipse(this.x + p.cos(this.velocity * this.direction)*100 + this.offset.x, this.y + this.offset.y, this.diameter, this.diameter);

					// prepare for the next step
					this.targetDiameter -= this.targetDiameter*0.015;
					this.targetOpacity -= this.targetOpacity*0.015;
				}
			};    

			return Constr;
		}());

		/* p5.js native setup callback */
		p.setup = function() {
			var i;

			// create canvas encopmassing the whole window
			p.createCanvas($(window).width(), $(window).height());
			
			// generate color spectrum
			generateColors();			

			// generate maximum possible number circles so there's no need of re-running the setup if user chooses to have more circles than current value
			for(i = 0; i < config.noOfCircles.range.max; i++) {
				// generate a circle with random coordinates and add it to the array
				circles.push(new Circle(p.random(p.width), p.random(p.height)));
			}

			// attach behaviour for when another portion of audio data is available
			audioDataAnalyser.onAudioProcess = function(frequencyDomainData, timeDomainData) { 
				for(i = 0; i < circles.length; i++) {
					// get the respective frequency domain data for this circle, normalizing it to 0...1 range 
					circles[i].magnitude = frequencyDomainData !== null ? frequencyDomainData[circles[i].band]/256 : 0; 
				}
			};
		};

		/* custom callback to recalculate global visualization settings when changed via customizer panel */
		p.refresh = function(settingId) {
			var i;

			// regenerate colour array if the option being changed is colour
			if(settingId.search(/color/i) !== -1) {
				generateColors();
			}

			if(settingId == 'blur') {
				p.drawingContext.canvas.style.webkitFilter = 'blur(' + config.blur.value + 'px)';
			}

			// all the other settings need to be changed on a per circle basis
			for(i = 0; i < circles.length; i++) {
				circles[i].refresh(settingId);
			}
		};

		/* p5.js native draw loop */
		p.draw = function() {
			var circle;

			// flush the pixels from the canvas
			p.clear();

			// redraw all the circles
			for(var i = 0; i < config.noOfCircles.value; i++) {
				circle = circles[i];

				// if a circle went down and off the screen, re-position it at the top
				if (circle.y > p.height + circle.diameter) {
					circle.y = -circle.diameter;
				}
				circle.redraw();
			}
		};

		/* custom callback that disposes of objects and any extra containers (i.e. not created by p5.js) created by this visualization */
		p.cleanup = function() {};
	},


	/* bars visualization */
	'bars': function(p) {
		var // canvas element providing WebGL context for this visualization
			canvas,

			state = Visualizer.config.fx.effects['bars'],
			config = state.settings,

			// array with bars' meshes
			bars = [],
			// array with edges for each bar
			edges = [],

			// groups for independent translations and easy deletions
			barGroup, edgeGroup,
			colors = [],

			// Bar class
			Bar,
			
			// three.js renderer for rendering scene
			renderer,
			// three.js scene
			scene,
			// three.js camera through which we'll see the scene
			camera,
			
			audioDataAnalyser = Visualizer.components.audioDataAnalyser,
			noOfBands = config.noOfBands.value,

			// bar pad will be a square (noOfBands x noOfBands)
			barPadSize = p.round(p.sqrt(noOfBands)),

			// shortcut to hex-to-RGB converter
			rgb = Visualizer.utils.convertToRgb,

			/* populates colors array with colours generated from low, medium and high frequency colours set in the configuration object */
			generateColors = function() {
				var i, 
					// helper variables
					rgbColor, fromColor, toColor, p5Color, 

					noOfBands = config.noOfBands.value,
					midFreqLimit = p.floor(0.5*noOfBands);

				// reset colors array 
				colors = [];

				// generate first half of the colors array (for low to medium frequencies)
				rgbColor = rgb(config.lowFreqColor.value);
				fromColor = p.color(rgbColor.r, rgbColor.g, rgbColor.b);
				rgbColor = rgb(config.midFreqColor.value);
				toColor = p.color(rgbColor.r, rgbColor.g, rgbColor.b);

				for(i = 0; i < midFreqLimit; i++) {					
					p5Color = p.lerpColor(fromColor, toColor, 1/midFreqLimit*i);

					// convert from p5 Colour to rgb(r, g, b) format
					colors.push('rgb(' + p.round(p5Color.getRed()) + ',' + p.round(p5Color.getGreen()) + ',' + p.round(p5Color.getBlue()) + ')');
				}

				// generate second half of the colors array (for medium to high frequencies)
				fromColor = toColor;
				rgbColor =rgb(config.hiFreqColor.value);
				toColor = p.color(rgbColor.r, rgbColor.g, rgbColor.b);

				for(i = midFreqLimit; i < noOfBands; i++) {
					p5Color = p.lerpColor(fromColor, toColor, 1/(noOfBands-midFreqLimit)*(i-midFreqLimit));
					colors.push('rgb(' + p.round(p5Color.getRed()) + ',' + p.round(p5Color.getGreen()) + ',' + p.round(p5Color.getBlue()) + ')');
				}
			}
			; 

		// update the FFT size 
		audioDataAnalyser.analyser.fftSize = noOfBands*2;

		/* private helper class representing a single bar */
		Bar = (function() {
			var Constr,
				geometry, 
				material,
				size = config.size.value;

			/* constructor functions; takes coordinates and a frequency bin this bar will represent */
			Constr = function(x, y, z, band) {
				this.band = band;
				this.color = new THREE.Color(colors[this.band]);

				// create geometry based on a relative size specified in configuration
				geometry = new THREE.BoxGeometry(size, size, size);

				// create basic material for this bar's mesh
  				material = new THREE.MeshPhongMaterial({
  					wireframe: config.isWireframe.value, // whether only wireframe should be shown
  					color: this.color,
  					opacity: config.opacity.value,
  					transparent: true // needed for opacity to be working
  				});

  				// create the mesh and store it as a property
				this.barObj = new THREE.Mesh(geometry, material);
				
				// set the pivot (reference) point to the bottom center
  				this.barObj.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(size, size, size/2));
  				
  				this.barObj.position.x = x;
  				this.barObj.position.y = y;
  				this.barObj.position.z = z;

  				// edge for this bar
  				this.edgeObj = null;

  				// parameters for this bar
  				this.amplifier = config.amplifier.value;
  				this.magnitude = 0;
  				this.scale = 0;
  				this.initialScale = size/8;
  				this.targetScale = 0; 

			};

			/* Bar class public methods */
			Constr.prototype = {

				/* recalculates requested parameters for this bar */
				refresh: function(settingId) {

					switch(settingId) {
						
						case 'amplifier': 
							this.amplifier = config.amplifier.value;
							break;
						
						case 'opacity':
							this.barObj.material.opacity = config.opacity.value;
							break;
						
						case 'isWireframe':
							this.barObj.material.wireframe = config.isWireframe.value;
							// no need to display edge if the wireframe is turned on	
							this.edgeObj.material.opacity = config.isWireframe.value === true ? 0 : 1;
							break;

						// colors array has already been changed via p5 object's refresh function, what's left is to reassing them
						case 'lowFreqColor':
						case 'midFreqColor':
						case 'hiFreqColor':
							this.barObj.material.color.set(new THREE.Color(colors[this.band]));
							break;					
					}
				},

				/* redraws the bar for the current animation frame */
				redraw: function() {
					// calculate scale value for the next step
					this.targetScale = p.max(this.targetScale, this.initialScale + this.amplifier * (p.exp(this.magnitude) - 1));

					// update the scale value and make transition more seamless by getting the fraction of delta
					this.scale += 0.4 * (this.targetScale - this.scale);
				
					this.barObj.scale.z = this.scale;

					// prepare for the next frame
					this.targetScale -= this.targetScale*0.01;	
				}
			};

			return Constr;
		}());
		
		/* p5.js native setup callback */
		p.setup = function() {
			var // helper variables
				bar,
				light,
				i, j, k = 0;

			generateColors();

			// containers for bars and their edges
			barGroup = new THREE.Object3D();
			edgeGroup = new THREE.Object3D();

			// p5.js forces operation on 2D canvas whereas three.js needs WebGL so we'll disable the former and create our own canvas
			p.noCanvas();

			// create canvas element
			canvas = $('<canvas>').appendTo('#'+Visualizer.config.fx.wrapperId)[0];
			
			// create renderer attached to that canvas, turn on antialiasing, make it transparent
			renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});

			// set size to full viewport size
			renderer.setSize($(window).width(), $(window).height());
			
			// create scene
			scene = new THREE.Scene();

			// create camera with 45 degree field of view, canvas dimensions and front and back clipping planes
			camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 1, 4000);

			// add camera to the scene
			scene.add(camera);

			// create the bar pad
      		for(i = 0; i < barPadSize; i++) {

      			// i-th row
      			bars[i] = [];
      			edges[i] = [];

      			for(j = 0; j < barPadSize; j++) {		
      				
      				// create bar row centering the bars around (0, 0, 0); add a gap of 0.1
      				bar = new Bar(
      						(i - barPadSize / 2)*(config.size.value + 0.1), // x-coord
      						(j - barPadSize / 2)*(config.size.value + 0.1), // y-coord
      						0, // z-coord
      						k++ // band value (frequency this bar represents)
      					);

      				// add bar to the array
      				bars[i][j] = bar;

      				// add bar's mesh to the group
      				barGroup.add(bar.barObj);

      				// create an edge for this bar's mesh
      				bar.edgeObj = new THREE.EdgesHelper(bar.barObj, 0x333333);
     			
      				edgeGroup.add(bar.edgeObj);
      			}
      		}

      		// add bars and edges to the scene
      		scene.add(edgeGroup);
      		scene.add(barGroup);

      		// set to initial scale
      		barGroup.scale.x = config.scale.value;
			barGroup.scale.y = config.scale.value;
			barGroup.scale.z = config.scale.value;

			// set to initial rotation 
			barGroup.rotation.x = p.radians(config.xRotation.value);
			barGroup.rotation.y = p.radians(config.yRotation.value);
			barGroup.rotation.z = p.radians(config.zRotation.value);

      		// add one ambient and three directional lights to the scene
			scene.add(new THREE.AmbientLight(0x777777));

			// set right light source
			light = new THREE.DirectionalLight(0xffffff, 0.85);
			light.position.set(0.8, 0.7, 0.2);
			scene.add(light);

			// set left light source
			light = new THREE.DirectionalLight(0xffffff, 0.85);
			light.position.set(-0.8, -0.7, 0);
			scene.add(light);

			// set top light source
			light = new THREE.DirectionalLight(0xffffff, 0.85);
			light.position.set(0, 0.9, 0.9);
			scene.add(light);

			// set camera parameters	
			camera.rotation.x = Math.PI/3;
			camera.position.y = -28;
			camera.position.z = 20;
			camera.lookAt(new THREE.Vector3(0,0,0));

			// attach behaviour for when another chunk of frequency spectrum data is analysed
			audioDataAnalyser.onAudioProcess = function(frequencyDomainData, timeDomainData) { 
				var i, j, k = 0;
				
				for(i = 0; i < bars.length; i++) {
					for(j = 0; j < bars[i].length; j++) {

						// normalize the magnitude for the current bar before assigning it
						bars[i][j].magnitude = frequencyDomainData !== null ? frequencyDomainData[k++]/256 : 0;
					}
				}
			};

			
		};

		/* recalculates the global settings being changed via visualization customizer */
		p.refresh = function(settingId) {
			var // helper variables
				i, j, k = 0, bar;
			
			// changing the number of bands requires regeneration of the whole bar pad
			if(settingId == 'noOfBands') {

				// remove existing bars and edges
				scene.remove(edgeGroup);
				scene.remove(barGroup);

				// recreate respective groups and arrays
				barGroup = new THREE.Object3D();
				edgeGroup = new THREE.Object3D();
				bars = [];
				edges = [];

				// update bin size				
				audioDataAnalyser.analyser.fftSize = config.noOfBands.value * 2;
				
				barPadSize = p.round(p.sqrt(config.noOfBands.value));

				generateColors();

				// generate the bar pad
				for(i = 0; i < barPadSize; i++) {
	      			bars[i] = [];
	      			edges[i] = [];

	      			for(j = 0; j < barPadSize; j++) {		
	      				
	      				// create a row centering the bars around (0, 0, 0); add a gap of 0.1
	      				bar = new Bar((i-barPadSize/2)*(config.size.value + 0.1), (j-barPadSize/2)*(config.size.value + 0.1), 0, k++);
	      				
	      				bars[i][j] = bar;
	      				barGroup.add(bar.barObj);

	      				bar.edgeObj = new THREE.EdgesHelper(bar.barObj, 0x333333);
	      				edgeGroup.add(bar.edgeObj);
	      			}
	      		}

	      		scene.add(edgeGroup);
	      		scene.add(barGroup);

	      		// update bar pad rotation to current values
	      		barGroup.rotation.x = config.xRotation.value;
	      		barGroup.rotation.y = config.yRotation.value;
	      		barGroup.rotation.z = config.zRotation.value;

				return;
			}

			if(settingId == 'scale') {
				barGroup.scale.x = config.scale.value;
				barGroup.scale.y = config.scale.value;
				barGroup.scale.z = config.scale.value;
				return;
			}

			// apply changes in rotation
			if(settingId.search(/rotation/i) !== -1) {
				if(settingId == 'xRotation') {
					barGroup.rotation.x = p.radians(config[settingId].value);
				} else if(settingId == 'yRotation') {
					barGroup.rotation.y = p.radians(config[settingId].value);
				} else if(settingId == 'zRotation') {
					barGroup.rotation.z = p.radians(config[settingId].value);
				}
				return;
			}

			// regenerate colour array if the option being changed is colour
			if(settingId.search(/color/i) !== -1) {
				generateColors();
			}

			// remaining settings have to be changed on a per bar basis
			for(i = 0; i < bars.length; i++) {
				for(j = 0; j < bars[i].length; j++) {
					bars[i][j].refresh(settingId);
				}
			}
		};

		/* p5.js native drawing loop */
		p.draw = function() {
			var i, j, 
				speed = config.autorotationSpeed.value;
			
			// draw each bar
			for(i = 0; i < bars.length; i++) {
				for(j = 0; j < bars.length; j++) {
					bars[i][j].redraw();
				}
			}

			// if rotating, update respective range sliders on the customizer panel; this will trigger rotation of the bar pad itself
			if(speed > 0) {					
				$('#bars-xRotation').trigger('input', p.degrees(barGroup.rotation.x + 0.01 * speed/10));
				$('#bars-yRotation').trigger('input', p.degrees(barGroup.rotation.y + 0.01 * speed/10));
				$('#bars-zRotation').trigger('input', p.degrees(barGroup.rotation.z + 0.01 * speed/10));	
			}
			
			renderer.render(scene, camera);
		};

		/* custom function that disposes of any extra containers (i.e. not created by p5.js) created by this visualization */
		p.cleanup = function() {
			$(canvas).remove();
		};
	},


	/* waves visualization */
	'waves': function(p) {
		var // canvas element providing WebGL context for this visualization
			canvas,

			state = Visualizer.config.fx.effects['waves'],
			config = state.settings,

			// iterates with each frame 
			frameIterator = 0,

			// three.js renderer for rendering scene
			renderer,
			// three.js scene
			scene,
			// three.js camera through which we'll see the scene
			camera,

			// analyser and audio data holder
			audioDataAnalyser = Visualizer.components.audioDataAnalyser,
			audioData, 

			// Wave class
			Wave,
			
			// all the waves currently in the scene
			waves = [],

			// volume level colors array
			colors = [],

			// shortcut to rgb utility
			rgb = Visualizer.utils.convertToRgb,

			/* generates colours representing volumes from low to high using minimum and maximum volumes colours */
			generateColors = function() {
				var i, rgbColor, fromColor, toColor, p5Color;

				// reset the array
				colors = [];

				// generate first half of the array (colours for volumes from +max to 0)
				rgbColor = rgb(config.maxVolumeColor.value);
				fromColor = p.color(rgbColor.r, rgbColor.g, rgbColor.b);
				rgbColor = rgb(config.minVolumeColor.value);
				toColor = p.color(rgbColor.r, rgbColor.g, rgbColor.b);

				for(i = 0; i < 128; i++) {		
					p5Color = p.lerpColor(fromColor, toColor, 1/128 * i*(p.pow(1/128*i, 3)));		
					colors.push('rgb(' + p.round(p5Color.getRed()) + ',' + p.round(p5Color.getGreen()) + ',' + p.round(p5Color.getBlue()) + ')');
				}

				// make second half of colors array a mirror of the first one (for volumes from 0 to -max)
				for(i = 128; i < 256; i++) {					
					colors.push(colors[256-i-1]);
				}
			}		
			; 

		/* helper class representing a single Wave in the scene */
		Wave = (function() {
			var Constr,
				material,
				geometry,
				strength
				;

			/* constructor function; takes current time-domain data */
			Constr = function(audioData) {	
				// create point cloud material for this wave
				material = new THREE.PointCloudMaterial({					
					sizeAttenuation: true, // make points smaller with the distance
					transparent: true, 
					opacity: config.opacity.value,
					size: 0.2, // size of each point in the cloud
					vertexColors: THREE.VertexColors // enable colors for individual points
				});

				geometry = new THREE.Geometry();

				// create a wave centered at (0, 0 ,0)				
				for (var i = 0; i < config.pointsPerWave.value; i++) {

					// number of points in the wave will be different from number of samples in the audio data (1024) for most of the time so we need to match the two
					strength = audioData[p.floor(audioData.length / config.pointsPerWave.value * i)];

					// points are added to the wave by creating vertices and adding them to wave's geometry
				    geometry.vertices[i] = 
				    	new THREE.Vector3(

					    	// x-coordinate: wave is shifted to the left by width/2 so the middle particle sits on (0, 0, 0) point
					    	-config.waveWidth.value/2+i*(config.waveWidth.value/config.pointsPerWave.value),

					    	// y-coordinate: strength of the signal of the signal; it is in range of (0...256) with no signal at 128 so needs to be shifted downwards on y-axis
					    	((256/2)-strength)*0.05*config.amplifier.value * 2, 

					    	// z-coordinate
							0
						);
				    geometry.colors[i] = new THREE.Color(colors[strength]);
				}

				// we've got all it takes to create a point cloud representing the wave
				this.cloud = new THREE.PointCloud(geometry, material);
			};

			Constr.prototype = {
				refresh: function(settingId) {}
			};

			return Constr;
		}());

		/* p5.js native setup callback */
		p.setup = function() {

			generateColors();

			// visualization of time-domain data works best for larger FFT window size
			audioDataAnalyser.analyser.fftSize = 1024*2;
			
			// P5.js uses 2D but we need WebGL so we'll disable it and create our own canvas
			p.noCanvas();
			
			// create canvas element
			canvas = $('<canvas>').appendTo('#'+Visualizer.config.fx.wrapperId)[0];
			
			// create renderer attached to that canvas, turn on antialiasing, make it transparent
			renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});

			// set size to full viewport size
			renderer.setSize($(window).width(), $(window).height());
			
			// create scene
			scene = new THREE.Scene();

			// create camera with 45 degree field of view, canvas dimensions and front and back clipping planes
			camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 0.1, 4000);

			// reposition the camera according to the configuration settings	
			camera.position.x = config.horizontalPan.value * 1000;
			camera.position.y = config.verticalPan.value * 1000;
			camera.position.z = config.proximity.value * 1000;
		
			// direct camera at the front part of the visualization
			camera.lookAt(new THREE.Vector3(0, 0, -20));

			scene.add(camera);

			scene.add(new THREE.AmbientLight(0x777777));	
		};

		/* recalculates the visualization global settings being changed via  customizer */
		p.refresh = function(settingId) {
			var i,
				// helper array used for removing excess waves in case user decreases their amount
				excessArray
				; 

			// update camera position as requested
			if(settingId == 'horizontalPan') {
				camera.position.x = config.horizontalPan.value*1000;
			} else if(settingId == 'verticalPan') {
				camera.position.y = config.verticalPan.value*1000;
			} else if(settingId == 'proximity') {
				camera.position.z = config.proximity.value*1000;

			// update number of waves
			} else if(settingId == 'noOfWaves') {

				// if there are excess waves remove them from the scene and update waves array
				if(parseInt(config.noOfWaves.value) < waves.length) {
					excessArray = waves.slice(parseInt(config.noOfWaves.value - 1));
					for(i = 0; i < excessArray.length; i++) {
						scene.remove(excessArray[i].cloud);
					}
					waves = waves.slice(0, parseInt(config.noOfWaves.value) - 1);
				}
			}

			// regenerate colour array if the option being changed is colour
			if(settingId.search(/color/i) !== -1) {
				generateColors();
			}			
		};

	
		p.draw = function() {			
			var wave, i, volume; // temporary variables

			// update camera, keep pointing it roughly at the front of the scene
			camera.lookAt(new THREE.Vector3(0, 0, -waves.length*5 / 4));

			// depending on the generation interval, scene can be regenerated every n-th frame
			if(frameIterator % config.generationInterval.value === 0) {

				// access time-domain data
				audioData = new Uint8Array(audioDataAnalyser.analyser.frequencyBinCount);
				audioDataAnalyser.analyser.getByteTimeDomainData(audioData);

				// create wave based on the current time-domain data
				wave = new Wave(audioData);

				// keep track of this wave in the waves array
				waves.push(wave);

				// add point cloud object of this wave to the scene
				scene.add(wave.cloud);

				// push the remaining waves away from the camera and skew if necessary
				for(i = 0; i < waves.length; i++) {
					waves[i].cloud.position.z -= 0.5 * config.waveSpacing.value;
					waves[i].cloud.rotation.z += p.radians(config.skew.value * 360) / config.noOfWaves.value;
				}

				// if number of generated waves is to exceed the requested number, remove the farthest wave
				if (waves.length === parseInt(config.noOfWaves.value)) {
					scene.remove(waves.shift().cloud);
				}			    
			}

			renderer.render(scene, camera);

			// another frame has passed
			frameIterator++;
		};

		/* disposes of any extra containers (i.e. not created by p5.js) created by this visualization */
		p.cleanup = function() {
			$(canvas).remove();
			canvas = null;
		};
	}	
};



/* class managing an audio graph and providing real time data via AnalyserNode */

Visualizer.classes.audio.AudioDataAnalyser = (function() {
	var Constr,
		config = Visualizer.config.audioDataAnalyser,

		// get smoothing factor and default number of bins available from the configuration object
		smoothingTimeConstant = config.smoothingTimeConstant,
		bufferSize = config.bufferSize,

		// context object for building an audio graph
		audioContext,

		// <audio> tag data source
		audioSource = null,
		// input stream (microphone) data source
		microphoneSource = null
		;


	// find out if getUserMedia() function for accepting microphone input is available and under what name
	navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;

	/* constructor function */
	Constr = function() {      
		var that = this,
			
			// current frequency-domain analysis frame
			frequencyDomainData,

			// current time-domain analysis frame
			timeDomainData,

			// <audio> tag
			audioTag,

			// will allow access to audio data for analysis
			scriptProcessor,

			// AnalyserNode instance
			analyser;

		// obtain context by trying standardized then older Chrome versions
		audioContext = new (window.AudioContext || window.webkitAudioContext)();

		// get <audio> tag
		audioTag = $('audio')[0];

		// screate ScriptProcessorNode instance for direct audio analysis; pass buffer size and number of input and output channels
		scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);

		// create AnalyserNode instance
		analyser = audioContext.createAnalyser();
	
		// will need access to the analyser from outside of this class
		this.analyser = analyser;

		// apply configuration options
		analyser.smoothingTimeConstant = smoothingTimeConstant;
		analyser.fftSize = bufferSize * 2;


		// initialize frequency and time-domain data 8-bit arrays; pass number of bins that will be available
		frequencyDomainData = new Uint8Array(analyser.frequencyBinCount);
		timeDomainData = new Uint8Array(analyser.frequencyBinCount);

		// if there's enough audio data available for the track to be played (and processed), create the graph
		audioTag.addEventListener('canplay', (function() {
		
			// create audio source only if it haven't been created already
			if(audioSource === null) {
				audioSource = audioContext.createMediaElementSource(audioTag);
			}
			
			// connect the <audio> tag source to the analyser
			audioSource.connect(analyser);

			// connect analyser to the script processor
			analyser.connect(scriptProcessor);

			// connect processor to the destination of the context so we can access the analysed data
			scriptProcessor.connect(audioContext.destination);

			// connect audio source to the destination (speakers) so we can hear the sound
			audioSource.connect(audioContext.destination);

			// attach a handler for whenever new chunk of audio data is ready for analysis
			$(scriptProcessor).on('audioprocess', function() {

				// populate respective arrays with frequency and time-domain data
				analyser.getByteFrequencyData(frequencyDomainData);
				analyser.getByteTimeDomainData(timeDomainData);

				// fire callback specified by visualization function using this analyser; pass in arrays populated with audio data
				if(that.onAudioProcess !== undefined) {
					that.onAudioProcess(frequencyDomainData, timeDomainData);
				}						
				
			});
		}));
	};

	/* public methods of the analyser */
	Constr.prototype = {

		/* enables input stream from the microphone */
		enableMicrophone: function() {
			var that = this;

			// see if there's support for enabling input stream via user's device (microphone)
			if(navigator.getUserMedia) {

				// open stream only if it's not created already
				if(microphoneSource === null) {
					navigator.getUserMedia(

						// we're interested in audio only
						{
							audio: true
						}, 

						// success callback
						function(stream) {

							// on success create the stream source and connect it to the analyser
							microphoneSource = audioContext.createMediaStreamSource(stream);
							microphoneSource.connect(that.analyser);
		
						}, 

						// failure callback						
						function(error) {
							Visualizer.components.messenger.errorMessage('Unable to get the stream because the access to use the microphone is denied. Please re-enable the permission.', true);
						});

				// if the microphone source already exists don't recreate it; just reconnect it to the analyser	
				} else {
					microphoneSource.connect(that.analyser);
				}

			// no support for using user's audio input device
			} else {
				Visualizer.components.messenger.errorMessage('Your browser doesn\'t support input streaming. ');
				$('#microphone-toggle').removeClass('enabled').addClass('disabled');
			}	
		},

		/* turns off streaming from microphone */
		disableMicrophone: function() {
			if(microphoneSource !== null) {
				microphoneSource.disconnect();
			}
		}
	};

	return Constr;
}());



/* audio player panel */

Visualizer.classes.audio.AudioPlayer = (function() {
	var config = Visualizer.config.audioPlayer, 

		// outermost container (player container and handle)
		$wrapper = $('#'+config.wrapperId), 

		// components
		$handle = $('.handle', $wrapper), 
		$microphoneToggle = $('#microphone-toggle'),
		$playerContainer = $('#player-container'), 

		// container wrapping around <audio> element
		$player = $('#'+config.playerId), 

		// whether it should be initially opened
		isOpened = config.isOpened,

		/* slides panel down or up depending on the confObj.action passed ('open' or 'close') */
		toggle = function(confObj) {
			var shouldClose = confObj.action == 'close';

			$wrapper.animate({
					bottom: shouldClose ? -$playerContainer.height() : 0
				}, confObj.animate ? config.toggleTime : 0, 'linear', function() {
					if(shouldClose) {
						$('.open-arrow', $handle).show();
						$('.close-arrow', $handle).hide();
					} else {
						$('.open-arrow', $handle).hide();
						$('.close-arrow', $handle).show();
					}
				}
			);
		}, 
		
		Constr;

	/* constructor function */
	Constr = function() {
		var that = this;
		this.$wrapper = $wrapper;

		// initialize jPlayer 
		$player.jPlayer(config.jPlayerConf);

		// make handle functional
		$handle.on('click', function() {
			if(that.isOpened) {
				that.close(true);
			} else {
				that.open(true);
			}
		});

		// make microphone toggle button functional
		$microphoneToggle.on('click', function() {

			// if it's disabled, enable it
			if($(this).hasClass('disabled')) {
				$(this).removeClass('disabled').addClass('enabled');

				// pause the player before allowing microphone input (can be still played though)
				$('#player').jPlayer('pause');

				// enable the microphone stream
				Visualizer.components.audioDataAnalyser.enableMicrophone();

			// if it's enabled, disable it
			} else {
				$(this).removeClass('enabled').addClass('disabled');
				Visualizer.components.audioDataAnalyser.disableMicrophone();
			}
		});

		if(isOpened) {
			this.open(false);
		} else {
			this.close(false);
		}
	};

	/* public audio player methods */
	Constr.prototype = { 

		/* loads and plays MP3 data passed via drag and drop; accepts data URI passed via FileReader */
		load: function(mp3DataURI) {

			// file is available at this stage so hide the loading icon
			$('#player-loading', $playerContainer).hide();

			// delegate MP3 source to the data URI and play
			$player.jPlayer('setMedia', {
				mp3: mp3DataURI
			});
			$player.jPlayer('play');
		},

		/* displays loading icon when MP3 file is being fetched */
		wait: function() {
			$('#player-pause, #player-play', $playerContainer).hide();
			$('#player-loading', $playerContainer).show();
		},

		/* slides the player down */
		close: function(animate) {
			this.isOpened = false;
			toggle({action: 'close', animate: animate});
		}, 

		/* slide the player up */
		open: function(animate) {
			if(!this.isOpened){ 
				this.isOpened = true;
				toggle({action: 'open', animate: animate});
			}			
		}  
	};

	return Constr;
}());


Visualizer.init = function() {

	var // shortcuts to the objects we'll use
		classes = Visualizer.classes,
		config = Visualizer.config,
		components = Visualizer.components,

		// helper variable to check whether <canvas> element is supported
		testCanvas;


	/* initialize all components */

	// visualizer's main container  
	components.$visualizer = $('#'+ config.visualizerId);

	// messenger object for displaying the tour and error messages	
	components.messenger = new classes.Messenger();
	
	// audio player panel
	components.audioPlayer = new classes.audio.AudioPlayer();

	// background video panel
	components.videoPlayer = new classes.video.VideoPlayer();

	// video picker panel
	components.videoPicker = new classes.video.VideoPicker();

	// audio data analyser 	
	components.audioDataAnalyser = new classes.audio.AudioDataAnalyser();

	// visualization manager 
	components.fxManager = new classes.fx.FXManager();

	// visualization picker panel
	components.fxPicker = new classes.fx.FXPicker()
	;


	// test for support of <canvas> element 
	testCanvas = document.createElement('canvas');
	if(!(testCanvas.getContext && testCanvas.getContext('2d'))) {
		components.messenger.errorMessage('Your browser doesn\'t support HTML &lt;canvas&gt; and WebGL.');

		// no reason to continue, interrupt script execution
		throw Error('No basic support');
	}

	// show the visualizar overview
	components.messenger.playTour();


	// enable drag & drop functionality for user's MP3 files (if supported)
	if(window.FileReader) {

		// visualizer will become a drop target for user dragged and dropped MP3 files
		components.$visualizer

			// cancel default event handling while file is dragged into and over a drop target
			.on('dragenter dragover', function(e) {
				components.audioPlayer.open(true);
				e.preventDefault();
				return false;
			})

			// on file drop create the FileReader instance and fetch the file data
			.on('drop', function(e) {
				
				var // cross-browser dataTransfer property which contains dropped file information (second version for Chrome)
					dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer,

					// reader object
					mp3Reader = new FileReader();

				// prevent default browser behaviour (i.e. navigating out of the page and to the browser's media player)
				e.preventDefault();
				
				// read the file data as data URI
				mp3Reader.readAsDataURL(dataTransfer.files[0]);


				$(mp3Reader)
					// while the file loads tell audio player to display waiting icon
					.on('loadstart', function() {
						components.audioPlayer.wait();
					})
					// when loading is finished load and play the track (accessed via FileReader.result)
					.on('loadend', function() {
						components.audioPlayer.load(this.result);
					});						

				return false;
			});

	// no support for drag and drop
	} else {
		components.messenger.errorMessage('Your browser doesn\'t support file drag and drop.');
	}
};          



/* general utilities */     

Visualizer.utils = (function() {
	return {

		/* converts hexadecimal colour notation to array with RGB values */
		convertToRgb: function(hex) {

			// put three hexadecimal colour components in separate elements of the RGB array
			var rgbArray = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

			// convert hexadecimal values to decimal before returning the whole array
			return {
				r: parseInt(rgbArray[1], 16),
				g: parseInt(rgbArray[2], 16),
				b: parseInt(rgbArray[3], 16)
			};
		}
	};
})();



/* on document load start the application */

$(function() {

	Visualizer.init();

});