-- CREATE USERS TABLE
CREATE TABLE users(
   id SERIAL, 
   nickName VARCHAR(100) NOT NULL,
   phoneNumber VARCHAR(50) NOT NULL,
   indicative VARCHAR(50) NOT NULL,
   PRIMARY KEY (id)
);

-- CREATE TRIGGER FOR REPEATED PHONE NUMBERS
delimiter //
CREATE TRIGGER checkRepeatedPhoneNumber BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE phoneNumber=NEW.phoneNumber) THEN
        SIGNAL SQLSTATE '50002' SET MESSAGE_TEXT = 'Already exist one User with that Phone Number';
    END IF; 
END;// 
delimiter ;

-- CREATE TOKENS TABLE
CREATE TABLE tokens (
    id SERIAL,
    token VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    user_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CREATE TRIGGER FOR REPEATED TOKEN
delimiter //
CREATE TRIGGER checkRepeatedToken BEFORE INSERT
ON tokens
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM tokens WHERE token=NEW.token AND active=true) THEN
        SIGNAL SQLSTATE '50002' SET MESSAGE_TEXT = 'Already exist an equal token active';
    END IF;
END;//
delimiter ;

-- ADD USER RECORD
INSERT INTO users (nickName, phoneNumber, indicative)
VALUES ("Twilio","+447401232937", "+44");

-- ADD TOKEN RECORD
INSERT INTO tokens (token, user_id)
VALUES ("442172976342",
       (SELECT id FROM users WHERE phoneNumber="+447401232937")
);

-- SELECT's
SELECT u.nickName
FROM tokens t
INNER JOIN users u ON t.user_id=u.id 
WHERE t.active = true
AND u.phoneNumber = "+447401232937";

SELECT u.nickName
FROM tokens t,
     users u 
WHERE t.user_id=u.id 
AND t.active = true
AND u.phoneNumber = "+447401232937";

SELECT DISTINCT u.*,
                (CASE WHEN (SELECT COUNT(t1.active) FROM tokens t1 where t1.active = true AND t.user_id = t1.user_id ) > 0 then true else false end) 
FROM tokens t
INNER JOIN users u ON t.user_id=u.id 
AND u.phoneNumber = "+447401232937";
