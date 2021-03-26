---
published: true
category: blog
layout: blog
summary: How does walk signal timing affect simulated trips in Seattle?
---

Seattle has recently made changes to how long they think pedestrians should
have to wait before they get a "Walk" signal.

Eventually we'd lke to show a simulation of Rainier Beach in Seattle.

<div id="app-root">
</div>

<style type="text/css"> 
#app-root {
  height: 400px;
}
</style>

<script type="module">
  // import { WidgetryDemo } from "/js/street_sim/widgetry_demo_app/widgetry_demo_app.js";
  //let widgetryDemoApp = new WidgetryDemo("app-root");

  // import { FifteenMinute } from "/js/street_sim/fifteen_min_app/fifteen_min_app.js";
  // let fifteenMinuteApp = new FifteenMinute("app-root");

  import { ABStreet } from "/js/street_sim/abstreet_app/abstreet_app.js";
  let abstreetApp = new ABStreet("app-root");

  $(document).ready(async function() {
      //await widgetryDemoApp.loadAndStart();
      //await fifteenMinuteApp.loadAndStart();
      await abstreetApp.loadAndStart();
  });
</script>

That's all!

