self.addEventListener('sync', function(event) {
  const buyEvent = JSON.parse(event.tag);
  fetch('/buy', {
      method: "POST",
      body: JSON.stringify(buyEvent),
      headers: {"Content-Type":"application/json"}
  });
  self.registration.showNotification(
    `Bought ${buyEvent.name} for ${buyEvent.expectedPrice}`,
  );
});
