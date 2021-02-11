---
published: true
category: blog
layout: blog
summary: How does walk signal timing affect simulated trips in Seattle?
---

Seattle has recently made changes to how long they think pedestrians should
have to wait before they get a "Walk" signal.

This simulation shows a map of Rainier Beach in Seattle.

<div id="simulation">
</div>

<style type="text/css"> 
#simulation {
  height: 400px;
}
</style>

<script type="text/javascript" src="/js/simulation.js"></script>
<script type="text/javascript">
  let simulation = new Simulation("simulation", "http://abstreet.s3-website.us-east-2.amazonaws.com/dev/game/game_bg.wasm");
  $(document).ready(async function() {
      await simulation.load();
      await simulation.start();
  });
</script>

That's all!

