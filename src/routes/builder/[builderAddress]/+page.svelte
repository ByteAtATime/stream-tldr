<script lang="ts">
    import Markdown from "svelte-exmarkdown"

    export let data;
</script>

{#await data.summaryPromise}
    <p>Summarizing...</p>
{:then summary}
    <h1>{data.builderAddress}</h1>

    <div class="prose">
        <Markdown md={summary} />
    </div>
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
