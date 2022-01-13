-- CREATE REGISTRY TABLE
create table registry (
    id SERIAL,
    phoneNumber varchar(50) not null,
    indicative varchar(50) not null,
    token varchar(50) not null,
    active boolean DEFAULT true,
    primary key (id)
);

-- CREATE TRIGGER FOR REPEATED PHONE NUMBERS
delimiter //
CREATE TRIGGER checkRepeatedNumber BEFORE INSERT
ON registry
FOR EACH ROW
IF EXISTS (SELECT 1 FROM registry WHERE phoneNumber=NEW.phoneNumber AND active=true) THEN
SIGNAL SQLSTATE '50002' SET MESSAGE_TEXT = 'Phone already exists';
END IF; //
delimiter ;

-- ADD REGISTRY RECORD
INSERT INTO registry (phoneNumber, indicative, token)
VALUES ("+351966558950","+351", "351145642801");


----

CREATE TABLE users(
   id SERIAL, 
   fullName VARCHAR(100) NOT NULL,
   phoneNumber VARCHAR(50) NOT NULL,
   indicative VARCHAR(50) NOT NULL,
   PRIMARY KEY (id)
);

INSERT INTO users (fullName, phoneNumber, indicative)
VALUES ("Twilio","+447401232937", "+44");

CREATE TABLE tokens (
    id SERIAL,
    token VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    user_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL -> CASCADE
);

INSERT INTO tokens (token, user_id)
VALUES ("442172976342",
       (SELECT id FROM users WHERE phoneNumber="+447401232937")
);


SELECT u.fullName
FROM tokens t
INNER JOIN users u ON t.user_id=u.id 
WHERE t.active = true
AND u.phoneNumber = "+447401232937";

SELECT u.fullName
FROM tokens t,
     users u 
WHERE t.user_id=u.id 
AND t.active = true
AND u.phoneNumber = "+447401232937";