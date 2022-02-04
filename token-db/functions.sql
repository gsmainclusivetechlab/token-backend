-- CREATE USERS TABLE
CREATE TABLE users(
   id SERIAL, 
   nickName VARCHAR(100) NOT NULL,
   phoneNumber VARCHAR(50) NOT NULL,
   indicative VARCHAR(50) NOT NULL,
   otp INT NULL,
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
        SIGNAL SQLSTATE '50002' SET MESSAGE_TEXT = 'Already exist an equal active token';
    END IF;
END;//
delimiter ;

-- ADD STORE PROCEDURE

DELIMITER //
CREATE PROCEDURE GetAccount(IN identifier VARCHAR(50))
BEGIN
    CREATE TEMPORARY TABLE temp_user 
    (
        id INT NOT NULL,
        nickName VARCHAR(100) NOT NULL,
        phoneNumber VARCHAR(50) NOT NULL,
        indicative VARCHAR(50) NOT NULL,
        otp INT NOT NULL,
        active BOOLEAN DEFAULT false
    );

    INSERT INTO temp_user
    SELECT DISTINCT U.id, U.nickName, U.phoneNumber, U.indicative, U.otp, false
    FROM users U 
    LEFT JOIN tokens T ON T.user_id = U.id
    WHERE (U.phoneNumber = identifier OR T.token = identifier);

    IF (SELECT T.active 
        FROM tokens T, temp_user U 
        WHERE T.user_id=U.id 
        AND T.active=true
        AND (U.phoneNumber = identifier OR T.token = identifier)) IS NOT NULL
    THEN
        UPDATE temp_user
        SET active = true;
    END IF;

    SELECT * FROM temp_user;

    DROP TEMPORARY TABLE IF EXISTS temp_user;

END;//
DELIMITER ;

--- Helpers

mysqldump -u root -p --routines registry > registry_dump.sql