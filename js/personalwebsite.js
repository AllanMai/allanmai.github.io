$(document).ready(function () {

$("#bt_demo_toggle").click(function () {
    $("p.p_demo_toggle").toggle();
  });



$("#bt_demo_toggle_speed").click(function () {
    $("p.p_demo_toggle_speed").toggle("slow");
    // The optional speed parameter can take the following values: "slow", "fast", or milliseconds (e.g., 1000).
  });
});