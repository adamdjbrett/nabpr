---
#
# Use the widgets beneath and the content will be
# inserted automagically in the webpage. To make
# this work, you have to use › layout: frontpage
#
layout: frontpage
header:
  image_fullwidth: /images/cup-of-coffee-1280537-min3.jpg
widget1:
  title: "Blog & News"
  url: '/blog/'
  image: /images/news-1074604-302x182.jpg
  text: 'Keep up to date with NABPR.'
widget2:
  title: "Annual Meeting"
  url: '/2019-nabpr-meeting-program/'
  text: 'The Annual Meeting of the National Association of Baptist Professors of Religion will take place from May 20-22, 2019 at the First Baptist Church of Raleigh, NC.'
  image: /images/fbcraleigh-edenton-street-entrance1-full-302x182.jpg
widget3:
  title: "Renew Your Membership"
  url: '/membership/membership-dues/'
  image: /images/membership-302x182.jpg
  text: "Don't forget to renew your Membership dues before the Annual Meeting."
#
# Use the call for action to show a button on the frontpage
#
# To make internal links, just use a permalink like this
# url: /getting-started/
#
# To style the button in different colors, use no value
# to use the main color or success, alert or secondary.
# To change colors see sass/_01_settings_colors.scss
#
# callforaction:
#   url: /meetings/registration/
#   text: Register now for 2019 May meeting ›
#   style: alert
permalink: /index.html
redirect_from: /home/
#
# This is a nasty hack to make the navigation highlight
# this page as active in the topbar navigation
#
homepage: true
---
