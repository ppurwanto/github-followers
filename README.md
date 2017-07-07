# `github-followers` — An AngularJS GitHub User-Follower Explorer

This project is an AngularJS web app client for consuming GitHub's
API and providing a service to search a GitHub user and see a list of his/her
followers.

## The Problem
Although it's much simpler to use REST APIs like GitHub's instead of by Web Scraping
like I need to do for many other sites that don't have an API, it comes with its
own set of challenges. Notably, due to the popularity of GitHub, its user base
that this app explores is humongous. Further, like many APIs, GitHub has very
strict usage limits and rules for using its API, such as just about 1 query
allowed per minute with unauthenticated clients like this one, and even those
doing it via OAuth, but without supplying app's client ID and secret, has the same pitfall.
Finally, it's also needed to parse custom HTTP headers set by GitHub, such as
the 'Link' header for pagination and the various rate limit and caching headers.

## The Solution

AngularJS, even though not as shiny as Angular 4, still is great to work with
for making it so much easier to consume REST APIs like GitHub's, in addition to
streamlining the MVC/MVVM (modular code and separations of concerns) and SPA build
processes. Further, combined with my native JavaScript expertise and other libraries
like jQuery, it's been a lot of fun building this app. Also, I've used the
[Materialize CSS](http://materializecss.com) RWD/Material Design framework that
makes building attractive, modern UIs a breeze. Then, just like how some large
Websites did, I also did manage
details such as adding/ensuring API request throttling while still allowing
near-instant `autocomplete` suggestions and results, to keep down on redundant
instant requests when the query hasn't changed considerably. Finally, I did get to use a bit
of my Regular Expressions expertise for parsing GitHub's custom headers, like
the Link headers for pagination.

## If Only I had More Time . . .
* Fine tune more details/styling and straighten out blemishes.
* Add more CSS/Materialize animations, transitions, optimizations, etc.
* Try Travis Continuous Integration (CI) for continual, automated testing.
* Try Angular (Platform) v4 with TypeScript, and also deeper ES6+ usage.
* Be even more consistent in the language style guide that I follow
(mainly Google's JavaScript [style](https://google.github.io/styleguide/jsguide.html) [guides](https://google.github.io/styleguide/javascriptguide.xml))
and Todd Motto's [AngularJS style guide](https://github.com/toddmotto/angularjs-styleguide).
* More (practical ones) are in the form of TODO comments in my code.
* As reference, I have only few months to less than a year of experience with
Angular.js, jQuery, ES6+, Materialize CSS, SASS, etc. I do have over 8 years
experience with core JavaScript since & mostly from ES3. Also, since quality is
valued here, I spent a great deal of my time during this project to learn more
best practices and latest features instead of just implementation.

### What I Left Out
* Optimize API calls further for scalability, by checking Cache headers like 'If-Modified-Since' &
act accordingly, etc. Also use OAuth tokens instead of unauthenticated.
* More thorough unit (Karma/Jasmine) and integration/end-to-end (Protractor) tests.
* Adhere closely to OOP single responsibility principle & further separation/modularization of code.
* Minify files and convert ES6+ JS to ES5 with Gulp+Babel, etc. and modularize Angular & SCSS more.
* Implement logging, monitoring, and more error handling.
* Misc. are in the form of `TODO` comments in my code.

### What I Might Do Differently
On the other hand, had this been for a more longer-term project, then I might've
picked more newer technology stacks like Angular 4 Platform with TypeScript,
added scraping fallbacks if for some reason the scale is needed and can't be
satisfied just with GitHub's API alone, even after all performance tuning and 
caching has been performed.

## More Links from Me
### Link to Other Code I'm Particularly Proud of
* [CMS.SmartWebs.co](http://cms.smartwebs.co) - My Content Management System built from scratch.
* [LoyalSmile.UNIoSOFT.com](http://loyalsmile.uniosoft.com) - My Google Chrome Extension Making Life Simpler for Patrons of the Official Amazon Seller.
* [Maze-solving Robot](https://www.youtube.com/watch?v=PtqGUN-C-fc) & [Dancing Robots](http://new.livestream.com/accounts/1927261/GALATEA) I programmed during college.
* Please note, due to my work so far focusing on closed-source projects, I don't have
personal open-source code, but I can zip up some of the code of my projects upon request.
* Ultimately, I'm extremely proud of all of my work when they're the most challenging
and innovative, just like this very challenge!

### Link to My Public Profile
* [SmartWebs.co](http://www.smartwebs.co) - My Portfolio Site
* [My LinkedIn](https://www.linkedin.com/in/peter-purwanto/)

## Link to the Hosted Application
[github--followers.herokuapp.com](https://github--followers.herokuapp.com/)