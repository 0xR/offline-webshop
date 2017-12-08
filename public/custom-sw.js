self.addEventListener('sync', function(event) {
  const buyEvent = JSON.parse(event.tag);
  self.registration.showNotification(
    `Bought ${buyEvent.name} for ${buyEvent.expectedPrice}`,
  );
});
