'use strict';

function Constants() {

  this.WIDTH = 760;
  this.HEIGHT = 600;

  this.TABLE_WIDTH = 500;
  this.TABLE_HEIGHT = 350;

  this.CARD_WIDTH = 45;
  this.CARD_HEIGHT = 70;

  this.CARD_AREA_WIDTH = this.WIDTH;
  this.CARD_AREA_HEIGHT = this.CARD_WIDTH * 2;
  this.CARD_AREA_Y = this.HEIGHT - this.CARD_AREA_HEIGHT;
  this.CARD_AREA_PADDING = 10;
  this.CARD_PADDING = 5;

  this.TABLE_X = (this.WIDTH - this.TABLE_WIDTH) / 2;
  this.TABLE_Y = (this.HEIGHT - this.TABLE_HEIGHT - this.CARD_AREA_HEIGHT) / 2;

  this.DECK_WIDTH = 143 / 3;
  this.DECK_HEIGHT = 194 / 3;
  this.DECK_X = (this.WIDTH / 2) - (this.DECK_WIDTH / 2);
  this.DECK_Y = (this.CARD_AREA_Y / 2) - (this.DECK_HEIGHT/2);

  this.PLAYER_VERT_PADDING = 10;
  this.PLAYER_HORIZ_PADDING = 35;
  this.PLAYER_SIZE = 100;
  this.TEAM_FLAG_SIZE = 64;
  this.TRUMPSUIT_SIZE = 64;

  this.TRUMPSUIT_X = 10;
  this.TRUMPSUIT_Y = 35;
  this.TRUMPSUIT_PADDING = 16;

  this.TRUMPSUIT_CHOICE_X = (this.WIDTH / 2) - (2* (this.TRUMPSUIT_SIZE + this.TRUMPSUIT_PADDING));
  this.TRUMPSUIT_CHOICE_Y = (this.CARD_AREA_Y / 2) - (this.TRUMPSUIT_SIZE/2);

  this.PLAYER_MIDDLE_Y = (this.CARD_AREA_Y / 2) - (this.PLAYER_SIZE / 2);
  this.PLAYER_MIDDLE_X = (this.WIDTH / 2) - (this.PLAYER_SIZE / 2);
  this.PLAYER_END_X = this.WIDTH - this.PLAYER_SIZE - this.PLAYER_HORIZ_PADDING;
  this.PLAYER_END_Y = this.CARD_AREA_Y - this.PLAYER_SIZE - (4 * this.PLAYER_VERT_PADDING);

  this.PLAYER_X_ARR = [this.PLAYER_MIDDLE_X, this.PLAYER_HORIZ_PADDING, this.PLAYER_MIDDLE_X, this.PLAYER_END_X];
  this.PLAYER_Y_ARR = [this.PLAYER_END_Y, this.PLAYER_MIDDLE_Y, this.PLAYER_VERT_PADDING, this.PLAYER_MIDDLE_Y];
  
  this.TEXT_X_ARR = [this.PLAYER_MIDDLE_X + 0.5*this.PLAYER_SIZE, this.PLAYER_HORIZ_PADDING + 0.5*this.PLAYER_SIZE, this.PLAYER_MIDDLE_X + 0.5*this.PLAYER_SIZE, this.PLAYER_END_X + 0.5*this.PLAYER_SIZE];
  this.TEXT_MIDDLE_Y = this.CARD_AREA_Y / 2;
  this.TEXT_Y_ARR = [this.PLAYER_END_Y + this.PLAYER_SIZE + this.PLAYER_VERT_PADDING, this.TEXT_MIDDLE_Y + 0.5*this.PLAYER_SIZE + this.PLAYER_VERT_PADDING, 2*this.PLAYER_VERT_PADDING + this.PLAYER_SIZE, this.TEXT_MIDDLE_Y + 0.5*this.PLAYER_SIZE + this.PLAYER_VERT_PADDING];

  this.CARD_MIDDLE_Y = (this.CARD_AREA_Y / 2) - (this.CARD_HEIGHT / 2);
  this.CARD_MIDDLE_X = (this.WIDTH / 2) - (this.CARD_WIDTH / 2);
  this.CARD_X_ARR = [this.CARD_MIDDLE_X, this.CARD_MIDDLE_X - 2*this.CARD_WIDTH,this.CARD_MIDDLE_X, this.CARD_MIDDLE_X + 2*this.CARD_WIDTH];
  this.CARD_Y_ARR = [this.CARD_MIDDLE_Y + 0.5*this.CARD_HEIGHT, this.CARD_MIDDLE_Y, this.CARD_MIDDLE_Y - 0.75*this.CARD_HEIGHT, this.CARD_MIDDLE_Y];

  this.PLAYER_MOVE_ANIMATE_TIME = 500;
  this.PLAYER_CARD_ANIMATE_TIME = 250;

  this.SCORE_PADDING = 20;
  this.SCORE_FLAG_SIZE = 32;
  this.SCORE_FLAG_X = [this.WIDTH - this.SCORE_FLAG_SIZE - 2*this.SCORE_PADDING, this.WIDTH - this.SCORE_FLAG_SIZE - 2*this.SCORE_PADDING];
  this.SCORE_FLAG_Y = [this.SCORE_PADDING, this.SCORE_PADDING + this.SCORE_FLAG_SIZE];

  this.SCORE_FONT_SIZE = 20;
  this.SCORE_TEXT_PADDING = 15;
  this.SUIT_TRANSLATION_TABLE = { 'DIAMONDS' : 'd', 'CLUBS' : 'c', 'SPADES' : 's', 'HEARTS' : 'h'};
  this.SUIT_ORDER = { 'DIAMONDS' : '0', 'CLUBS' : '1', 'SPADES' : '3', 'HEARTS' : '2'};
  this.RANK_TRANSLATION_TABLE = [undefined, undefined, '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];
}

var constants = new Constants();
