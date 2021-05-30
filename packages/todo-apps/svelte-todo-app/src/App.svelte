<script>
  import Items from "./Items.svelte";
  import {writable} from "svelte/store"
  let list = writable([]);
  function onKeyUp(e) {
    if (e.key === "Enter") {
      const text = e.target.value;
	  $list.push({value: text, key: $list.length});
	  $list = $list;
      // Clear TODO
      e.target.value = "";
    }
  }
</script>

<main>
  <h1>
    <input placeholder="What needs to be done" on:keyup="{onKeyUp}"/>
  </h1>
  <Items list={list}/>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
