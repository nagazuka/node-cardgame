/**
 * External configuration file. 
 */ 
var conf = {
  GOOGLE_ANALYTICS_CODE : 'UA-642674-4',
  FACEBOOK_APPID : '256384804442526',

  lang: 'nl',

  font: 'Ubuntu',	

	network: {
    host: 'localhost',
    port: 9080
	},
  
  imageDir: 'images/',
  avatarDirectory: 'images/avatars/',  
  cardsDirectory: 'images/cards/', 
  
  suitsDirectory: 'images/suits/', 
  suitIcons: {
    'SPADES': 'Spades64.png',
    'CLUBS': 'Clubs64.png',
    'DIAMONDS': 'Diamond64.png',
    'HEARTS': 'Hearts64.png'
  },

  flagDir: 'images/flags/64/', 
  flagSmallDir: 'images/flags/32/', 
  teamFlags: {
    'Team Suriname': 'Suriname.png',
    'Team Nederland': 'Netherlands.png'
  },
	
	// my skins
	skins: {		
		gray:  {
			backgroundColor: '#666666',
			buttonColor: '#333333',
			opacity: 0,
			time: false,
			autoHide: false
		}
	}
	
};

if (typeof module !== 'undefined') {
  module.exports = {
    network : conf.network
  }
}
