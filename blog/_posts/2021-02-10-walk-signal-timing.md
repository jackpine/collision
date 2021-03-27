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
  import { WidgetryDemo } from "/js/widgetry_apps/widgetry_demo/widgetry_demo.js";
  let widgetryDemoApp = new WidgetryDemo("app-root");

  import { FifteenMinute } from "/js/widgetry_apps/fifteen_min/fifteen_min.js";
  let fifteenMinuteApp = new FifteenMinute("app-root");

  import { ABStreet } from "/js/widgetry_apps/abstreet/abstreet.js";
  let abstreetApp = new ABStreet("app-root");

  $(document).ready(async function() {
      //await widgetryDemoApp.loadAndStart();
      //await fifteenMinuteApp.loadAndStart();
      await abstreetApp.loadAndStart();
  });
</script>

That's all!

