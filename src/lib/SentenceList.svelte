<script lang="ts">
  import type { User } from "@supabase/supabase-js";
  ``;
  import Sentence from "./Sentence.svelte";
  import { supabase } from "./db";
  import Alert from "./Alert.svelte";
  import { onMount } from "svelte";
  import { paginate, LightPaginationNav } from "svelte-paginate";

  let sentences = [];
  let currentPage = 1;
  let pageSize = 4;
  $: paginatedSentences = paginate({ items: sentences, pageSize, currentPage });

  export let user: User;

  let newSentenceText = "";
  let errorText = "";

  const randomMinute = () => {
    const minMinute = 1;
    const maxMinute = 2;

    return Math.floor(Math.random() * (maxMinute - minMinute + 1)) + minMinute;
  };

  onMount(async () => {
    const data = await getSentences();

    sentences = data;

    const pushNotification = (text: string) => {
      if (!window.Notification) {
        console.log("Browser does not support notifications.");
        return;
      }

      if (Notification.permission === "granted") {
        var notify = new Notification(text);
        return;
      }

      Notification.requestPermission()
        .then(function (permission) {
          if (permission === "granted") {
            var notify = new Notification(text);
          } else {
            console.log("User blocked notifications.");
          }
        })
        .catch(function (err) {
          console.error(err);
        });
    };

    const loop = async () => {
      console.log("Call loop to show alert!");

      const srsSentences = (await getSentences())?.filter((sentence) => {
        const today = new Date();
        const latestStudyAt = new Date(sentence.latest_study_at);

        return today.toISOString() > latestStudyAt.toISOString();
      });

      if (!srsSentences?.length) {
        console.log("No sentences");
      }

      if (srsSentences?.length) {
        const randomIndex = Math.floor(Math.random() * srsSentences.length);

        pushNotification(srsSentences[randomIndex]?.text);

        updateSentence(srsSentences[randomIndex]?.id);
      }

      const randMs = randomMinute() * 60 * 1000;
      console.log("Loop in", randMs / 60 / 1000, "minutes", `(${randMs}ms)`);

      setTimeout(async () => {
        await loop();
      }, randMs);
    };

    loop();
  });

  const getSentences = async () => {
    let { data, error } = await supabase
      .from("sentences")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log("error", error);
      return [];
    } else {
      return data;
    }
  };

  const addSentence = async (text: string) => {
    const txt = text?.trim()?.replace(/  +/g, " ");
    if (txt?.length) {
      let { data: sentence, error } = await supabase
        .from("sentences")
        .insert({ text: txt, user_id: user.id })
        .select()
        .single();

      if (error) {
        errorText = error.message;
      } else {
        sentences = [...sentences, sentence];
        newSentenceText = "";
      }
    }
  };

  const deleteSentence = async (id: number) => {
    try {
      await supabase.from("sentences").delete().eq("id", id);
      sentences = sentences.filter((x) => x.id != id);
    } catch (error) {
      console.log("error", error);
    }
  };

  const updateSentence = async (id: number) => {
    try {
      const date = new Date();

      date.setDate(date.getDate() + 1);
      const { error } = await supabase
        .from("sentences")
        .update({ latest_study_at: date })
        .eq("id", id)
        .select("id")
        .single();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.log("error", error);
    }
  };
</script>

<div class="w-full">
  <h1 class="mb-12">SRS Sentences</h1>
  <form
    on:submit|preventDefault={() => addSentence(newSentenceText)}
    class="flex gap-2 my-2"
  >
    <input
      class="rounded w-full p-2"
      type="text"
      placeholder="Nice to meet you!"
      bind:value={newSentenceText}
    />
    <button type="submit" class="btn-black"> Add </button>
  </form>
  {#if !!errorText}
    <Alert text={errorText} />
  {/if}
  <div class="bg-white shadow overflow-hidden rounded-md">
    <ul>
      {#each paginatedSentences as sentence (sentence.id)}
        <Sentence {sentence} onDelete={() => deleteSentence(sentence.id)} />
      {/each}
    </ul>

    <LightPaginationNav
      totalItems={sentences.length}
      {pageSize}
      {currentPage}
      limit={1}
      showStepOptions={true}
      on:setPage={(e) => (currentPage = e.detail.page)}
    />
  </div>
</div>
