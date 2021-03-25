---
published: true
category: blog
layout: blog
summary: How does walk signal timing affect simulated trips in Seattle?
---

Seattle has recently made changes to how long they think pedestrians should
have to wait before they get a "Walk" signal.

Eventually we'd lke to show a simulation of Rainier Beach in Seattle.

For starts though, here's the widgetry demo:
<div id="widgetry-demo-root">
</div>

And here's the fifteen min app:
<div id="fifteen-min-root">
</div>

<style type="text/css"> 
#widgetry-demo-root {
  height: 400px;
}

#fifteen-min-root {
  height: 600px;
}
</style>

<script type="module">
  // import { WidgetryDemo } from "/js/street_sim/widgetry_demo_app/widgetry_demo_app.js";
  // let widgetryDemoApp = new WidgetryDemo("widgetry-demo-root");

  import { FifteenMinute } from "/js/street_sim/fifteen_min_app/fifteen_min_app.js";
  let fifteenMinuteApp = new FifteenMinute("fifteen-min-root");

  $(document).ready(async function() {
      // await widgetryDemoApp.loadAndStart();
      await fifteenMinuteApp.loadAndStart();
  });
</script>

That's all!

