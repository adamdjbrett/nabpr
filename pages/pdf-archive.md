---
title: WordPress PDF & Image Archive Index
layout: page
permalink: /pdf-archive/
---
## PDF & Image Archive


{% assign pdf_files = site.static_files | where: "pdf", true %}
{% for mypdf in pdf_files %}
  [⤓ {{mypdf.name}}]({{ mypdf.path }})
{% endfor %}
