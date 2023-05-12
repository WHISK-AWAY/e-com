# NOTES

## Cart

- create guest user (role = guest)
- keep user id in session token
  - enables us to keep guest carts in database
  - must purge these periodically to prevent having too much inventory tied up in abandoned carts
    - should also do this for "real" users, maybe with a longer expiration

## Abandoned Carts

- add updatedAt timestamp to user cart
- 'touch' updatedAt during addtocart/removefromcart methods
- write helper function to read each user's cart's updatedAt time
  - purge cart if updatedAt is sufficiently old
- set helper function on server-level setInterval (daily? can we execute @ a given time?)

## Passport

### Session cookies
