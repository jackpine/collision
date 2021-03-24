---
published: true
category: blog
layout: blog
summary: How does walk signal timing affect simulated trips in Seattle?
---

Seattle has recently made changes to how long they think pedestrians should
have to wait before they get a "Walk" signal.

This simulation shows a map of Rainier Beach in Seattle.

<div id="simulation-root">
</div>

<style type="text/css"> 
#simulation-root {
  height: 400px;
}
</style>

<script type="module">
  import { WidgetryApp } from "/js/widgetry.js";

  // TODO: pass in wasm URL
  let app = new WidgetryApp("simulation-root");

  $(document).ready(async function() {
      await app.loadAndStart();
  });
</script>

That's all!

