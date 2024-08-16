<script lang="ts">
    import Markdown from "svelte-exmarkdown"
    import { shortenAddress } from "$lib/utils";
    import { ensClient } from "$lib/client";

    export let data;

    const {builderAddress, summaryPromise} = data;

    const ensNamePromise = ensClient.getEnsName({
        address: builderAddress
    });

    const displayAddress = shortenAddress(builderAddress);
</script>

<div class="flex flex-col items-center">
    <h1 class="font-bold text-2xl">
        {#await ensNamePromise}
            {displayAddress}
        {:then ensName}
            {ensName ?? displayAddress}
        {:catch _}
            {displayAddress}
        {/await}
    </h1>

    {#await summaryPromise}
        <div class="loading loading-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    {:then summary}
        <div class="prose">
            <Markdown md={summary}/>
        </div>
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</div>