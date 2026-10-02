---
layout: page
show_meta: false
title: "Style your content!"
subheadline: "Layouts of Feeling Responsive"
permalink: "/design/"
breadcrumb: true
---
<ul>
    {% assign design_posts = collections.posts | category: "design" %}
    {% for post in design_posts %}
    <li><a href="{{ post.url }}">{{ post.data.title }}</a></li>
    {% endfor %}
</ul>
