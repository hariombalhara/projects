<script>
    export let list
    import Item from './Item.svelte'
    function removeItem(key) {
        $list = $list.filter(function(item){
            return item.key !== key;
        })
    }
</script>
{#each $list as item(item.key) }
    <Item item={item.value}></Item>
    <span style='float:right' on:click={()=>{removeItem(item.key)}}>X</span>    
{/each}
