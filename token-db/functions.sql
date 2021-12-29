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
