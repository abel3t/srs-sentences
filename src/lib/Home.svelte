<script>
  import { supabase } from "./db";
  import SentenceList from "./SentenceList.svelte";

  export let user;
</script>

<div
  class="w-full h-full flex flex-col justify-start items-center p-2"
  style="min-width: 250px; max-width: 600px; margin: auto;"
>
  <SentenceList {user} />
  <button
    class="btn-black w-full mt-12"
    on:click={async () => {
      const { error } = await supabase.auth.signOut();
      if (error) console.log("Error logging out:", error.message);
    }}
  >
    Logout
  </button>
</div>
