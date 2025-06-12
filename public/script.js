async function deleteTool(id) {
    await fetch('/delTool/' + id, {method: 'DELETE'});
    window.location.href = "/"
   }
   

   async function editTool(e, id) {
    e.preventDefault();
   
    const formData = new FormData(e.target);
    const formObject = Object.fromEntries(formData.entries());
   
    await fetch('/upTool/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formObject)
    });
   
    window.location.href = '/'
   }

