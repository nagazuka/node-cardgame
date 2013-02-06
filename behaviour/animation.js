'use strict';

function TextTask(element, text) {
    this.element = element;
    this.text = text;
    this.type = "TextTask";
};

TextTask.prototype = new AsyncTask;
TextTask.prototype.run = function() {
        this.element.attr({'text': this.text});
        this.element.attr({'opacity': '1','fill': 'white'});
        this.finish();
};

function RemoveTask(element) {
    this.element = element;
    this.type = "RemoveTask";
};

RemoveTask.prototype = new AsyncTask;
RemoveTask.prototype.run = function() {
        this.element.hide();
        this.element.remove();
        this.finish();
};

function AnimationTask(element, attr, time, callback) {
  this.element = element;
  this.type = "AnimationTask";
  this.attr = attr;
  this.time = time;
  this.callback = callback;
};

AnimationTask.prototype = new AsyncTask;
AnimationTask.prototype.run = function() {
      var self = this;
      var compositeCallback = function () {
        if (self.callback) {
          self.callback.apply(this);
        }
        self.finish();
      };
      var animation = Raphael.animation(this.attr, this.time, ">", compositeCallback);
      this.element.show().stop().animate(animation);
};

function CompositeAnimationTask(animationList) {
  this.animationList = animationList;
  this.type = "CompositeAnimationTask";
  this.animCount = animationList.length;
  this.finishedAnimCount = 0;
};

CompositeAnimationTask.prototype = new AsyncTask;
CompositeAnimationTask.prototype.run = function() {
      var self = this;

      var i;
      for (i in self.animationList) {
        var currAnim = self.animationList[i];
        var compositeCallback = function () {
          if (currAnim.callback) {
            currAnim.callback.apply(this);
            self.finishedAnimCount += 1;
            if (self.finishedAnimCount == self.animCount) {
              self.finish();
            }
          }
        };
        var animation = Raphael.animation(currAnim.attr, currAnim.time, ">", compositeCallback);
        currAnim.element.show().stop().animate(animation);
      }
};

function AnimationWithTask(animationList) {
  this.animationList = animationList;
  this.type = "AnimationWithTask";
  this.animCount = animationList.length;
  this.finishedAnimCount = 0;
};

AnimationWithTask.prototype = new AsyncTask;
AnimationWithTask.prototype.run = function() {
      //gcconsole.debug("Running multi animation task");
      var self = this;

      var i;
      var firstAnim;
      var animation;
      var element;
      for (i in self.animationList) {
        var currAnim = self.animationList[i];

        if (i == 0) {
          var firstAnimCallback = function () {
            if (currAnim.callback) {
              currAnim.callback.apply(this);
            }
            self.finish();
          };
          //gcconsole.debug("Running first animation");
          animation = Raphael.animation(currAnim.attr, currAnim.time, ">", firstAnimCallback);
          element = currAnim.element.show().stop().animate(animation);
        } else {
          var animCallback = function () {
            if (currAnim.callback) {
              currAnim.callback.apply(this);
            }
          };
          //gcconsole.debug("Running other animations");
          currAnim.element.show().stop().animateWith(element, animation, currAnim.attr, currAnim.time, ">", animCallback);
        }
      }
};

